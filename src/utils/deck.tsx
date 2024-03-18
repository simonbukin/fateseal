export type Card = {
  name: string;
  quantity: number;
};

export function parseDeckList(deck: string[]): Card[] {
  return deck.map((line) => parseLine(line));
}

function parseLine(line: string): Card {
  const [unparsedQuantity, ...nameArray] = line.split(" ");

  const name = nameArray.join(" ");
  const quantity = +unparsedQuantity;

  return {
    name,
    quantity,
  };
}
