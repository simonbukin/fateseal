import { BasicCard, Print, RawCard, FatesealCard } from "@/types/cards";

export function parseDeckList(deck: string[]): RawCard[] {
  return deck.map((line) => parseLine(line)).flat();
}

export function parseLine(input: string): RawCard[] {
  const regex =
    /^(?<quantity>\d+)\s+(?<name>.*?)(?:\s+\((?<set>.*?)\))?(?:\s+(?<collectorNumber>\S+))?(?:\s+\*(?:\S+)\*)?$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error("Invalid input format");
  }

  const [, quantityStr, cardName, setName, collectorNumberRaw] = match;

  const quantity = parseInt(quantityStr, 10);
  const name = cardName.trim();
  const set = setName ? setName.trim().toLocaleLowerCase() : undefined;
  const collectorNumber = collectorNumberRaw
    ? collectorNumberRaw.trim()
    : undefined;

  if (quantity <= 0) {
    throw new Error("Quantity must be positive");
  }

  return Array.from({ length: quantity }).map(() => {
    return {
      name,
      quantity,
      set,
      collectorNumber,
    };
  });
}

export type CardError = {
  card: RawCard;
  error: string;
  fix?: string;
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
        error: `Card not found: ${card.name}`,
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
