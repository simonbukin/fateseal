"use client";

import { Card, parseDeckList } from "@/utils/deck";
import { useEffect, useState } from "react";
import { Button, Checkbox, Textarea } from "@mantine/core";

function DeckEntry() {
  const [deckList, setDeckList] = useState("");
  const [parsedDeckList, setParsedDeckList] = useState<Card[]>();
  const [showParsed, setShowParsed] = useState(false);

  useEffect(
    function parse() {
      setParsedDeckList(parseDeckList(deckList.split("\n")));
    },
    [deckList]
  );

  return (
    <div className="max-w-lg">
      <Textarea
        value={deckList}
        onChange={(e) => setDeckList(e.target.value)}
        className="text-slate-800"
        size="md"
        label="Your decklist"
        description="Paste your decklist below, in the MTGO format."
        placeholder="Input placeholder"
      />
      <Checkbox
        defaultChecked
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
      <Button fullWidth variant="filled" color="violet" size="md">
        Parse
      </Button>
    </div>
  );
}

export default DeckEntry;
