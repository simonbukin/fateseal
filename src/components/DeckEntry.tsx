"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, TextInput } from "@mantine/core";
import { deckToObjects } from "@/utils/ttExport";
import MTGCard from "./MTGCard";
import { BasicCard, RawCard, FatesealCard } from "@/types/cards";
import { CardError, decklistToCards, parseDeckList } from "@/utils/deck";

export type CardData = { [card: string]: FatesealCard };

function DeckEntry() {
  const [deckList, setDeckList] = useState("");
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState<BasicCard[]>();
  const [extras, setExtras] = useState<BasicCard[]>();
  const [errorCards, setErrorCards] = useState<CardError[]>();
  const [cardData, setCardData] = useState<CardData>();

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
    if (!cardData) return;

    const parsedDecklist: RawCard[] = parseDeckList(
      deckList.split("\n").filter((line) => line.length !== 0)
    );

    const { resultingCards, extraCards, errorCards } = decklistToCards(
      parsedDecklist,
      cardData
    );

    setCards(resultingCards);
    setExtras(extraCards);
    setErrorCards(errorCards);
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
        description="Paste your decklist below, in the MTGO format. You can include a set name and collector number as well."
        placeholder={`1 Imperial Recruiter\n2 Mountain (SLD) 1193`}
      />
      {errorCards && (
        <ul>
          {errorCards.map((errorCard, i) => {
            return (
              <li key={errorCard.card.name + i}>
                <p className="text-red-500">
                  {errorCard.error} {errorCard.card.name}
                </p>
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
      {cards && (
        <ul className="absolute grid grid-cols-2 gap-2">
          {cards.map((card, i) => {
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
