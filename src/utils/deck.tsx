export type RawCard = {
  name: string;
  quantity: number;
};

export type ScryfallCard = {
  id: string;
  name: string;
  imageUrl: string;
};

export function parseDeckList(deck: string[]): RawCard[] {
  return deck.map((line) => parseLine(line)).flat();
}

export function parseLine(line: string): RawCard[] {
  if (line.length === 0) {
    throw new Error("Line must not be empty");
  }
  const [unparsedQuantity, ...nameArray] = line.split(" ");

  const name = nameArray.join(" ");
  const quantity = +unparsedQuantity;
  if (quantity <= 0) {
    throw new RangeError("Quantity must be positive");
  }

  return Array.from({ length: quantity }).map((item, index) => {
    return {
      name,
      quantity,
    };
  });
}
