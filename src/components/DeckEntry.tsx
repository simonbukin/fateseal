"use client";

import { useEffect, useState } from "react";
import { Box, Button, LoadingOverlay, Textarea, TextInput } from "@mantine/core";
import { deckToObjects } from "@/utils/ttExport";
import MTGCard from "./MTGCard";
import { BasicCard, RawCard, FatesealCard, Print } from "@/types/cards";
import {
  CardError,
  decklistToCards,
  parseDeckList,
  rawDeckToDeckListString,
} from "@/utils/deck";
import Fuse from "fuse.js";
import { LastUpdated } from "./LastUpdated";
import CardSelector from "./CardSelector";

export type CardData = { [card: string]: FatesealCard };

function DeckEntry() {
  const [deckList, setDeckList] = useState("");
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState<BasicCard[]>([]);
  const [rawDeck, setRawDeck] = useState<RawCard[]>([]);
  const [extras, setExtras] = useState<BasicCard[]>([]);
  const [errorCards, setErrorCards] = useState<CardError[]>([]);
  const [cardData, setCardData] = useState<CardData>();
  const [fuse, setFuse] = useState<Fuse<string>>();
  const [customBackUrl, setCustomBackUrl] = useState("");
  const [customCommanderUrl, setCustomCommanderUrl] = useState("");
  const [customBackError, setCustomBackError] = useState(false);
  const [commanderError, setCommanderError] = useState(false);
  const [isSelectorOpen, setSelectorOpen] = useState(false);
  const [selectedCardForPrinting, setSelectedCardForPrinting] = useState<
    string | null
  >(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/cards.json");
        const data: CardData = await response.json();

        const options = {
          includeScore: true,
        };
        const fuse = new Fuse(
          Object.values(data).map((card) => card.name),
          options
        );

        setFuse(fuse);
        setCardData(data);
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    };

    fetchData();
  }, []);

  function handleCardClick(card: BasicCard, index: number) {
    if (card.name === "Custom Commander") return;
    setSelectedCardForPrinting(card.name);
    setSelectedCardIndex(index);
    setSelectorOpen(true);
  }

  function handlePrintingSelect(print: Print) {
    if (selectedCardIndex === null) return;

    const newCards = [...cards];
    newCards[selectedCardIndex] = {
      ...newCards[selectedCardIndex],
      images: print.images,
      foil: print.foil,
      etched: print.etched,
    };
    setCards(newCards);

    const newRawDeck = [...rawDeck];
    newRawDeck[selectedCardIndex] = {
      ...newRawDeck[selectedCardIndex],
      set: print.set,
      collectorNumber: print.collectorNumber,
      foil: print.foil,
      etched: print.etched,
    };
    setRawDeck(newRawDeck);

    const newDeckList = rawDeckToDeckListString(newRawDeck);
    setDeckList(newDeckList);

    setSelectorOpen(false);
    setSelectedCardForPrinting(null);
    setSelectedCardIndex(null);
  }

  function handleParseClick() {
    if (!cardData) return;

    const parsedDecklist: RawCard[] = parseDeckList(
      deckList.split("\n").filter((line) => line.length !== 0)
    );
    setRawDeck(parsedDecklist);

    const { resultingCards, extraCards, errorCards } = decklistToCards(
      parsedDecklist,
      cardData
    );

    if (customCommanderUrl) {
      resultingCards.unshift({
        name: "Custom Commander",
        images: {
          front: customCommanderUrl,
        },
      });
    }

    errorCards.forEach((errorCard) => {
      const result = fuse?.search(errorCard.card.name)[0];
      errorCard.fix = result?.item;
    });

    setCards(resultingCards);
    setExtras(extraCards);
    setErrorCards(errorCards);
  }

  function handleExportClick() {
    if (cards.length > 0) {
      const deck = deckToObjects(cards, extras, customBackUrl);
      const blob = new Blob([JSON.stringify(deck, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${deckName || "fateseal"}.json`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  function displayCardError(card: CardError) {
    if (card.fix) {
      return `No match found for "${card.card.name}". Did you mean "${card.fix}"?`;
    } else {
      return `Could not find a match for "${card.card.name}". ${card.error}`;
    }
  }

  async function fixError(errorCard: CardError): Promise<void> {
    if (!errorCard.fix || !cardData) return;

    // Parse the current decklist
    const decklist = parseDeckList(
      deckList.split("\n").filter((line) => line.length !== 0)
    );

    // Create a new decklist with the fix applied (no mutation)
    const fixedDecklist: RawCard[] = decklist.map((card) => {
      if (card.name.toLowerCase() === errorCard.card.name.toLowerCase()) {
        // Apply the fix: replace error card name with the correct name
        // Preserve all other properties (set, collectorNumber, foil, etched)
        return {
          ...card,
          name: errorCard.fix!,
        };
      }
      return card;
    });

    // Use the utility function to rebuild the decklist string
    // This correctly handles spacing, set codes, collector numbers, and foil/etched flags
    const updatedDeckList = rawDeckToDeckListString(fixedDecklist);
    setDeckList(updatedDeckList);

    // Re-parse and get new cards/errors
    const {
      resultingCards,
      extraCards,
      errorCards: newErrorCards,
    } = decklistToCards(fixedDecklist, cardData);

    // Populate fix suggestions for remaining errors
    newErrorCards.forEach((newErrorCard) => {
      const result = fuse?.search(newErrorCard.card.name)[0];
      newErrorCard.fix = result?.item;
    });

    setCards(resultingCards);
    setExtras(extraCards);
    setErrorCards(newErrorCards);
  }

  return (
    <div className="relative w-full">
      <TextInput
        placeholder="Deck name"
        value={deckName}
        size="md"
        className="mb-4"
        label="Your deck's name"
        onChange={(e) => setDeckName(e.target.value)}
      />
      <Box pos="relative">
        <LoadingOverlay
          visible={!cardData}
          zIndex={10}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{
            children: (
              <div className="text-center">
                <div className="mb-2">Loading card database...</div>
                <div className="text-sm text-gray-500">
                  This may take a moment
                </div>
              </div>
            ),
          }}
        />
        <Textarea
          value={deckList}
          onChange={(e) => setDeckList(e.target.value)}
          size="md"
          autosize
          disabled={!Boolean(cardData)}
          minRows={5}
          maxRows={15}
          label={`Your decklist ${
            cards.length > 0
              ? `• (${cards.length} cards, ${extras.length} tokens, ${errorCards.length} errors)`
              : ""
          }`}
          description="Paste your decklist below, in the MTGO format. You can include a set name and collector number as well."
          placeholder={`1 Imperial Recruiter\n2 Mountain (SLD) 1193\n• • • `}
        />
        <LastUpdated />
      </Box>

      <TextInput
        placeholder="https://example.com/path/to/your/image.jpg"
        value={customBackUrl}
        size="md"
        className="mt-4"
        label="Custom back image URL"
        description="Optional: Provide a URL to your custom back image"
        onChange={(e) => {
          setCustomBackUrl(e.target.value);
          setCustomBackError(false);
        }}
      />
      {customBackUrl && (
        <>
          <img
            src={customBackUrl}
            className="max-w-full max-h-64 object-contain"
            onError={() => setCustomBackError(true)}
          />
          {customBackError && (
            <p className="text-red-500 mt-1">
              Failed to load image. Please check the URL.
            </p>
          )}
        </>
      )}
      <TextInput
        placeholder="https://example.com/path/to/your/commander.jpg"
        value={customCommanderUrl}
        size="md"
        className="mt-4"
        label="Custom Commander URL"
        description="Optional: Provide a URL to your custom commander image"
        onChange={(e) => {
          setCustomCommanderUrl(e.target.value);
          setCommanderError(false);
        }}
      />
      {customCommanderUrl && (
        <>
          <img
            src={customCommanderUrl}
            alt="Custom commander preview"
            className="mt-2 max-w-full max-h-64 object-contain rounded-lg"
            onError={() => setCommanderError(true)}
          />
          {commanderError && (
            <p className="text-red-500 mt-1">
              Failed to load commander image. Please check the URL.
            </p>
          )}
        </>
      )}
      {errorCards && (
        <ul className="mt-3">
          {errorCards.map((errorCard, i) => {
            return (
              <li
                className="flex flex-row gap-2 justify-between items-center"
                key={errorCard.card.name + i}
              >
                <p className="text-red-500">{displayCardError(errorCard)}</p>
                <Button
                  onClick={() => fixError(errorCard)}
                  variant="gradient"
                  gradient={{ from: "yellow", to: "orange", deg: 90 }}
                  size="md"
                  className="shrink-0"
                >
                  Yep
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <Button
        className="my-4"
        onClick={handleParseClick}
        fullWidth
        variant="gradient"
        gradient={{ from: "pink", to: "grape", deg: 90 }}
        color="purple"
        size="md"
      >
        Parse
      </Button>
      <Button
        disabled={!cards || cards.length < 1}
        className="my-4 mb-8"
        onClick={handleExportClick}
        fullWidth
        variant="gradient"
        gradient={{ from: "indigo", to: "cyan", deg: 90 }}
        color="purple"
        size="md"
      >
        Export
      </Button>
      <CardSelector
        isOpen={isSelectorOpen}
        onClose={() => setSelectorOpen(false)}
        cardName={selectedCardForPrinting}
        cardData={cardData}
        onSelectPrinting={handlePrintingSelect}
      />
      {cards && (
        <ul
          style={{
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
          className="absolute grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
        >
          {cards.map((card, i) => {
            return (
              <li
                key={card.images.front + `${i}---` + i}
                className={
                  extras && extras.length === 0 && i === cards.length - 1
                    ? "mb-4"
                    : ""
                }
              >
                <div
                  className="cursor-pointer"
                  onClick={() => handleCardClick(card, i)}
                >
                  <MTGCard card={card} />
                </div>
              </li>
            );
          })}
          {extras &&
            extras.map((card, i) => {
              return (
                <li
                  key={card.images.front + `${i}---` + i}
                  className={i === extras.length - 1 ? "mb-4" : ""}
                >
                  <MTGCard card={card} />
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

export default DeckEntry;
