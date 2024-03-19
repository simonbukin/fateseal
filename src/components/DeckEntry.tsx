"use client";

import { RawCard, ScryfallCard, parseDeckList } from "@/utils/deck";
import { useEffect, useState } from "react";
import { Button, Textarea, TextInput } from "@mantine/core";
import Image from "next/image";
import { deckToObjects } from "@/utils/ttExport";
import Fuse from "fuse.js";

function DeckEntry() {
  const [deckList, setDeckList] = useState("");
  const [deckName, setDeckName] = useState("");
  const [cardData, setCardData] = useState<ScryfallCard[]>();
  const [cards, setCards] = useState<ScryfallCard[]>();
  const [errorCards, setErrorCards] = useState<
    {
      errorCard: RawCard;
      suggestion?: string;
    }[]
  >();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/cards.json");
        const data = await response.json();
        setCardData(data);
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    };

    fetchData();
  }, []);

  function handleParseClick() {
    const errorCards = [];
    const resultingCards: ScryfallCard[] = [];
    if (!cardData) return;
    const parsedDeckList: RawCard[] = parseDeckList(
      deckList.split("\n").filter((line) => line.length !== 0),
    );
    for (const card of parsedDeckList || []) {
      try {
        const result = cardData.filter(
          (testCard) => testCard.name === card.name,
        );
        if (result.length === 1) {
          const { name, id, imageUrl } = result[0];
          resultingCards.push({
            name,
            id,
            imageUrl,
          });
        } else {
          errorCards.push(card);
        }
      } catch (e) {
        errorCards.push(card);
      }
    }
    setCards(resultingCards);

    const fuseOptions = {
      threshold: 0.4,
    };
    const fuse = new Fuse(
      cardData.map((card: ScryfallCard) => card.name),
      fuseOptions,
    );
    const errorsAndSuggestions = errorCards.map((errorCard) => {
      const suggestion = fuse.search(errorCard.name);
      const suggestionString = suggestion.length ? suggestion[0].item : "";
      return {
        errorCard,
        suggestion: suggestionString,
      };
    });
    setErrorCards(errorsAndSuggestions);
  }

  function handleExportClick() {
    if (cards) {
      const deck = deckToObjects(cards);
      const blob = new Blob([JSON.stringify(deck, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${deckName}.json`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="relative">
      <TextInput
        placeholder="Deck name"
        value={deckName}
        size="md"
        className="mb-2 text-slate-800"
        label="Your deck's name"
        onChange={(e) => setDeckName(e.target.value)}
      />
      <Textarea
        value={deckList}
        onChange={(e) => setDeckList(e.target.value)}
        className="text-slate-800"
        size="md"
        minRows={5}
        label="Your decklist"
        description="Paste your decklist below, in the MTGO format."
        placeholder={`1 Imperial Recruiter\n2 Mountain`}
      />
      {errorCards && (
        <ul>
          <p>Card{errorCards.length === 1 ? "" : "s"} not found:</p>
          {errorCards.map(({ errorCard, suggestion }) => {
            return (
              <li
                key={Math.random()}
                className="font-semibold text-red-500"
              >
                {errorCard.name}
                {suggestion ? `, did you mean ${suggestion}?` : ""}
              </li>
            );
          })}
        </ul>
      )}
      <Button
        className="my-2"
        onClick={handleParseClick}
        fullWidth
        variant="filled"
        color="violet"
        size="md"
      >
        Parse
      </Button>
      <Button
        disabled={!cards || cards.length < 1}
        className="my-2"
        onClick={handleExportClick}
        fullWidth
        variant="filled"
        color="violet"
        size="md"
      >
        Export
      </Button>
      {cards && (
        <ul className="absolute grid grid-cols-3 gap-2">
          {cards.map((card, i) => {
            return (
              <li key={card.id + i}>
                <Image
                  className="rounded-sm"
                  src={card.imageUrl}
                  alt={`The Magic card ${card.name}`}
                  width={667}
                  height={930}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default DeckEntry;
