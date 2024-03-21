import { RawCard } from "@/types/cards";

export type ScryfallCard = {
  name: string;
  cards: { [setAndCollector: string]: UrlAndAllParts };
};

export type UrlAndAllParts = {
  imageUrl: string;
  allParts: RelatedCard[];
};

export type RelatedCard = {
  id: string;
  object: "related_card";
  component: "token" | "meld_part" | "meld_result" | "combo_piece";
  name: string;
  type_line: string;
  uri: string;
};

export function parseDeckList(deck: string[]): RawCard[] {
  return deck.map((line) => parseLine(line)).flat();
}

export function parseLine(line: string): RawCard[] {
  if (line.length === 0) {
    throw new Error("Line must not be empty");
  }
  const [unparsedQuantity, ...nameArray] = line.split(" ");

  const lastElem = nameArray.at(-1);

  let collectorNumber: number | undefined;
  if (lastElem && !isNaN(+lastElem)) {
    collectorNumber = +lastElem;
  }

  let set: string | undefined;
  if (collectorNumber) {
    const setElement = nameArray.at(-2);
    set = setElement?.substring(1, setElement.length - 1).toLocaleLowerCase();
  } else {
    if (lastElem && lastElem.at(0) === "(" && lastElem.at(-1) === ")") {
      set = lastElem?.substring(1, lastElem.length - 1).toLocaleLowerCase();
    }
  }
  let sliceOff = nameArray.length;
  if (set) {
    sliceOff = -1;
  }
  if (collectorNumber) {
    sliceOff -= 1;
  }
  const nameArraySlice = nameArray.slice(0, sliceOff);
  const name = nameArraySlice.join(" ");
  const quantity = +unparsedQuantity;
  if (quantity <= 0) {
    throw new RangeError("Quantity must be positive");
  }

  return Array.from({ length: quantity }).map((item, index) => {
    return {
      name,
      set,
      collectorNumber,
      quantity,
    };
  });
}
