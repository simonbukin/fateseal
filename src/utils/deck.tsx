import { BasicCard, Print, RawCard, FatesealCard } from "@/types/cards";

export function parseDeckList(deck: string[]): RawCard[] {
  return deck.map((line) => parseLine(line)).flat();
}

export function parseLine(line: string): RawCard[] {
  if (line.length === 0) {
    throw new Error("Line must not be empty");
  }
  const [unparsedQuantity, ...nameArray] = line.split(" ");

  const lastElem = nameArray.at(-1);

  let collectorNumber: string | undefined;
  if (lastElem && !isNaN(+lastElem)) {
    collectorNumber = lastElem;
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

  return Array.from({ length: quantity }).map(() => {
    return {
      name,
      set,
      collectorNumber,
      quantity,
    };
  });
}

export type CardError = {
  card: RawCard;
  error: string;
};

export type DecklistToCardsResult = {
  resultingCards: BasicCard[];
  extraCards: BasicCard[];
  errorCards: CardError[];
};

export function decklistToCards(
  decklist: RawCard[],
  cardData: { [card: string]: FatesealCard }
): DecklistToCardsResult {
  const errorCards: CardError[] = [];
  const resultingCards: BasicCard[] = [];
  const extraCards: BasicCard[] = [];
  for (const card of decklist) {
    const result = cardData[card.name];

    if (!result) {
      errorCards.push({
        card,
        error: "Card not found",
      });
      continue;
    }

    const print = searchPrint(result.prints, card.set, card.collectorNumber);

    const resultingCard: BasicCard = {
      name: result.name,
      imageUrl: print.imageUrl,
    };
    resultingCards.push(resultingCard);

    const basicExtraCards: BasicCard[] =
      (print.associatedCards &&
        print.associatedCards
          .map((part) => {
            return cardData[part.name];
          })
          .filter((card) => card)
          .map((extraCard) => {
            return searchPrint(extraCard.prints, "t" + print.set);
          })
          .map((card) => {
            return {
              name: result.name,
              imageUrl: card.imageUrl,
            };
          })) ||
      [];
    extraCards.push(...basicExtraCards);
  }
  return {
    resultingCards,
    extraCards,
    errorCards,
  };
}

function searchPrint(
  prints: Print[],
  set?: string,
  collectorNumber?: string
): Print {
  let prints_ = [...prints];
  const defaultPrint = prints_[0];
  if (set) {
    prints_ = prints_.filter((print) => print.set === set);
  }
  if (collectorNumber) {
    prints_ = prints_.filter(
      (print) => print.collectorNumber === collectorNumber
    );
  }
  return prints_[0] ? prints_[0] : defaultPrint;
}
