"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, TextInput } from "@mantine/core";
import { deckToObjects } from "@/utils/ttExport";
import MTGCard from "./MTGCard";
import { BasicCard, RawCard, FatesealCard } from "@/types/cards";
import { CardError, decklistToCards, parseDeckList } from "@/utils/deck";
import Fuse from "fuse.js";

export type CardData = { [card: string]: FatesealCard };

function DeckEntry() {
  const [deckList, setDeckList] = useState("");
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState<BasicCard[]>();
  const [extras, setExtras] = useState<BasicCard[]>();
  const [errorCards, setErrorCards] = useState<CardError[]>();
  const [cardData, setCardData] = useState<CardData>();
  const [fuse, setFuse] = useState<Fuse<string>>();

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

  function handleParseClick() {
    if (!cardData) return;

    const parsedDecklist: RawCard[] = parseDeckList(
      deckList.split("\n").filter((line) => line.length !== 0)
    );

    const { resultingCards, extraCards, errorCards } = decklistToCards(
      parsedDecklist,
      cardData
    );

    errorCards.forEach((errorCard) => {
      const result = fuse?.search(errorCard.card.name)[0];
      errorCard.fix = result?.item;
    });

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

  function displayCardError(card: CardError) {
    if (card.fix) {
      return `Did you mean ${card.fix}?`;
    } else {
      return `${card.error}`;
    }
  }

  async function fixError(errorCard: CardError, j: number): Promise<void> {
    if (errorCard.fix) {
      const decklist = parseDeckList(
        deckList.split("\n").filter((line) => line.length !== 0)
      );
      let found = false;
      let i = 0;
      for (; i < decklist.length; i++) {
        if (decklist[i].name === errorCard.card.name) {
          found = true;
          break;
        }
      }
      if (found) {
        decklist[i] = {
          name: errorCard.fix,
          quantity: decklist[i].quantity,
          set: decklist[i].set,
          collectorNumber: decklist[i].collectorNumber,
        };
        setDeckList(() => {
          return decklist
            .map((card) => {
              return `${card.quantity} ${card.name}${
                card.set ? ` (${card.set.toLocaleUpperCase()})` : ""
              }${
                card.collectorNumber
                  ? card.collectorNumber.toLocaleUpperCase()
                  : ""
              }`;
            })
            .join("\n");
        });
        if (errorCards) {
          const errorCardsCopy = [...errorCards];
          errorCardsCopy.splice(j, 1);
          setErrorCards(errorCardsCopy);
        }
      } else {
        return;
      }
    } else {
      return;
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
        <ul className="mt-3">
          {errorCards.map((errorCard, i) => {
            return (
              <li
                className="flex flex-row justify-between items-center"
                key={errorCard.card.name + i}
              >
                <p className="text-red-500">{displayCardError(errorCard)}</p>
                <Button
                  onClick={() => fixError(errorCard, i)}
                  variant="gradient"
                  gradient={{ from: "yellow", to: "orange", deg: 90 }}
                  size="md"
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
        className="my-4 mb-8 outline outline-1 outline-slate-300"
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
                key={card.imageUrl + i}
                className={i === cards.length - 1 ? "mb-4" : ""}
              >
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
