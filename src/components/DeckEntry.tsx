"use client";

import { RawCard, ScryfallCard, parseDeckList } from "@/utils/deck";
import { useEffect, useState } from "react";
import { Button, Checkbox, Textarea } from "@mantine/core";
import Image from "next/image";

function DeckEntry() {
  const [deckList, setDeckList] = useState("");
  const [parsedDeckList, setParsedDeckList] = useState<RawCard[]>();
  const [showParsed, setShowParsed] = useState(false);
  const [cardData, setCardData] = useState<ScryfallCard[]>();
  const [cards, setCards] = useState<ScryfallCard[]>();
  const [errorCards, setErrorCards] = useState<RawCard[]>();

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

  useEffect(
    function parse() {
      setParsedDeckList(parseDeckList(deckList.split("\n")));
    },
    [deckList],
  );

  function handleParseClick() {
    const errorCards = [];
    const resultingCards: ScryfallCard[] = [];
    if (!parsedDeckList || !cardData) return;
    for (const card of parsedDeckList || []) {
      const result = cardData.filter(
        (testCard) => testCard.name === card.name,
      );
      console.log(result);
      if (result.length === 1) {
        const { name, quantity, id, image } = result[0];
        resultingCards.push({
          name,
          quantity,
          id,
          image,
        });
      } else {
        errorCards.push(card);
      }
    }
    setCards(resultingCards);
    setErrorCards(errorCards);
  }

  function handleExportClick() {}

  return (
    <div className="relative max-w-lg">
      <Textarea
        value={deckList}
        onChange={(e) => setDeckList(e.target.value)}
        className="text-slate-800"
        size="md"
        minRows={3}
        label="Your decklist"
        description="Paste your decklist below, in the MTGO format."
        placeholder={`1 Imperial Recruiter\n2 Mountain`}
      />
      <Checkbox
        className="my-4"
        label="Show parsed decklist"
        checked={showParsed}
        onChange={(event) => setShowParsed(event.currentTarget.checked)}
        description="For nerds!"
        color="violet"
        variant="outline"
        size="md"
      />
      {showParsed && (
        <div className="my-4">
          {parsedDeckList &&
            parsedDeckList.map(({ name, quantity }) => {
              return (
                <div key={name}>
                  <h1>
                    {quantity} of {name}
                  </h1>
                </div>
              );
            })}
        </div>
      )}
      <Button
        onClick={handleParseClick}
        fullWidth
        variant="filled"
        color="violet"
        size="md"
      >
        Parse
      </Button>
      {cards && (
        <ul className="absolute grid grid-cols-3 gap-2">
          {cards.map((card) => {
            return (
              <li key={card.id}>
                <Image
                  className="rounded-sm"
                  src={card.image}
                  alt="A Magic card"
                  width={667}
                  height={930}
                />
              </li>
            );
          })}
        </ul>
      )}
      <Button
        className="mt-2"
        onClick={handleExportClick}
        fullWidth
        variant="filled"
        color="violet"
        size="md"
      >
        Export
      </Button>
    </div>
  );
}

export default DeckEntry;
