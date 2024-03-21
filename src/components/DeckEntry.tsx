"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, TextInput } from "@mantine/core";
import { deckToObjects } from "@/utils/ttExport";
import MTGCard from "./MTGCard";
import { BasicCard, RawCard, ScryfallCard } from "@/types/cards";
import { parseDeckList } from "@/utils/deck";

function DeckEntry() {
  const [deckList, setDeckList] = useState("");
  const [deckName, setDeckName] = useState("");
  const [cardData, setCardData] = useState<{ [card: string]: ScryfallCard }>();
  const [cards, setCards] = useState<BasicCard[]>();
  const [cardImages, setCardImages] = useState<BasicCard[]>();
  const [extras, setExtras] = useState<BasicCard[]>();

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
    const errorCards: Set<string> = new Set();
    const cardImages: BasicCard[] = [];
    const resultingCards: BasicCard[] = [];
    const extraCards: BasicCard[] = [];
    if (!cardData) return;
    const parsedDeckList: RawCard[] = parseDeckList(
      deckList.split("\n").filter((line) => line.length !== 0)
    );
    for (const card of parsedDeckList) {
      try {
        const result = cardData[card.name];

        if (result) {
          const prints = result.prints;

          let setNarrow;
          let collectorNarrow;
          if (card.set) {
            setNarrow = prints.filter((print) => print.set === card.set);
            if (card.collectorNumber) {
              collectorNarrow = setNarrow.filter(
                (print) => print.collectorNumber === `${card.collectorNumber}`
              );
            }
          }

          // console.log(card.name);
          // console.log(prints.length);
          // console.log(setNarrow);
          // console.log(collectorNarrow);

          let print = prints[0];
          if (card.set && setNarrow) {
            print = setNarrow[0];
            if (card.collectorNumber && collectorNarrow) {
              print = collectorNarrow[0];
            }
          }

          const resultingCard = {
            name: result.name,
            imageUrl: print.imageUrl,
            associatedCards: print.associatedCards,
            allParts: print.associatedCards,
          };
          cardImages.push({ imageUrl: print.imageUrl, name: result.name });
          resultingCards.push(resultingCard);
          const extraCardsParsed =
            (print.associatedCards &&
              print.associatedCards
                .map((part) => {
                  return cardData[part.name];
                })
                .filter((card) => card)) ||
            [];
          const extraCardPicked = extraCardsParsed.map((card) => {
            return card.prints[0];
          });
          const extraCardsToBasics = extraCardPicked.map((card) => {
            return {
              name: result.name,
              imageUrl: card.imageUrl,
            };
          });
          extraCards.push(...extraCardsToBasics);
        } else {
          errorCards.add(card.name);
        }
      } catch (e) {
        errorCards.add(card.name);
      }
    }
    setCards(resultingCards);
    setCardImages(cardImages);
    setExtras(extraCards);
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
      link.download = `${deckName || "fateseal"}.json`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="relative w-full">
      <TextInput
        placeholder="Deck name"
        value={deckName}
        size="md"
        className="mb-4 text-slate-800"
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
        className="my-4 outline outline-1 outline-slate-300"
        onClick={handleExportClick}
        fullWidth
        variant="gradient"
        gradient={{ from: "indigo", to: "cyan", deg: 90 }}
        color="purple"
        size="md"
      >
        Export
      </Button>
      {cardImages && (
        <ul className="absolute grid grid-cols-2 gap-2">
          {cardImages.map((card, i) => {
            return (
              <li key={card.imageUrl + i}>
                <MTGCard card={card} />
              </li>
            );
          })}
          {extras &&
            extras.map((card, i) => {
              return (
                <li key={card.imageUrl + i}>
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
