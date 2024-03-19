export type RawCard = {
  name: string;
  quantity: number;
};

export type ScryfallCard = RawCard & {
  id: string;
  image: string;
};

export function parseDeckList(deck: string[]): RawCard[] {
  return deck.map((line) => parseLine(line));
}

function parseLine(line: string): RawCard {
  const [unparsedQuantity, ...nameArray] = line.split(" ");

  const name = nameArray.join(" ");
  const quantity = +unparsedQuantity;

  return {
    name,
    quantity,
  };
}
