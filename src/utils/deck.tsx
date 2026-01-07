import { BasicCard, Print, RawCard, FatesealCard } from "@/types/cards";

export function parseDeckList(deck: string[]): RawCard[] {
  return deck.map((line) => parseLine(line)).flat();
}

function extractInfo(
  string: string
): { set: string; before: string; after: string } | null {
  const match = string.match(/^(.*?)\s*\((\w+)\)\s*(.*)$/);
  if (match) {
    const set = match[2];
    const before = match[1];
    const after = match[3];
    return { set, before, after };
  } else {
    return null;
  }
}

export function parseLine(input: string): RawCard[] {
  if (!input || input.length === 0) {
    throw new Error("Input cannot be blank");
  }
  const [quantityStr, ...rest] = input.split(" ");
  const quantity = +quantityStr;
  const info = extractInfo(rest.join(" "));

  let name: string;
  let collectorNumber: string;
  let set: string;
  let foil: boolean = false;
  let etched: boolean = false;
  if (info) {
    const {
      set: setNameStr,
      before: nameStr,
      after: collectorNumberStr,
    } = info;
    if (collectorNumberStr) {
      if (collectorNumberStr.includes("*F*")) {
        foil = true;
      }
      if (collectorNumberStr.includes("*E*")) {
        etched = true;
      }
      collectorNumber = collectorNumberStr
        .split(" ")
        .filter((part) => part !== "*F*" && part !== "*E*")
        .join("");
    }
    if (setNameStr) {
      set = setNameStr;
    }
    name = nameStr;
  } else {
    name = rest.join(" ");
  }

  if (quantity <= 0) {
    throw new Error("Quantity cannot be negative");
  }

  return Array.from({ length: quantity }).map(() => {
    return {
      name,
      quantity: 1,
      set: set?.trim().toLocaleLowerCase(),
      collectorNumber: collectorNumber?.trim().toLocaleLowerCase(),
      foil: foil ? foil : undefined,
      etched: etched ? etched : undefined,
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

  // Track counts for stable ID generation
  const cardCounts: { [name: string]: number } = {};
  const extraCounts: { [name: string]: number } = {};

  for (const card of decklist) {
    const result = cardData[card.name];
    if (!result) {
      const existingError = errorCards.find(
        (error) => error.card.name === card.name
      );
      if (existingError) {
        existingError.card.quantity += card.quantity;
      } else {
        errorCards.push({
          card,
          error: `Card not found: ${card.name}`,
        });
      }
      continue;
    }

    const print = searchPrint(
      result.prints,
      card.set,
      card.collectorNumber,
      card.foil,
      card.etched
    );

    // Generate stable ID based on card name and occurrence count
    const normalizedName = result.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    cardCounts[normalizedName] = (cardCounts[normalizedName] || 0) + 1;
    const stableId = `card-${normalizedName}-${cardCounts[normalizedName]}`;

    const resultingCard: BasicCard = {
      id: stableId,
      name: result.name,
      images: {
        front: print.images.front,
        back: print.images.back,
      },
      foil: print.foil,
      etched: print.etched,
    };
    resultingCards.push(resultingCard);

    const basicExtraCards: BasicCard[] = [];
    if (print.associatedCards) {
      print.associatedCards.forEach((associatedCard) => {
        const normalizedExtraName = associatedCard.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        extraCounts[normalizedExtraName] = (extraCounts[normalizedExtraName] || 0) + 1;
        const extraId = `extra-${normalizedExtraName}-${extraCounts[normalizedExtraName]}`;

        basicExtraCards.push({
          id: extraId,
          name: associatedCard.name,
          images: associatedCard.images || {
            front: "https://i.imgur.com/Hg8CwwU.jpeg",
            back: "",
          },
        });
      });
    }
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
  collectorNumber?: string,
  foil?: boolean,
  etched?: boolean
): Print {
  let prints_ = [...prints];
  const defaultPrint = prints_[0];
  if (set) {
    prints_ = prints_.filter((print) => print.set.toLocaleLowerCase() === set);
  }
  if (collectorNumber) {
    prints_ = prints_.filter(
      (print) => print.collectorNumber.toLocaleLowerCase() === collectorNumber
    );
  }
  if (foil) {
    prints_ = prints_.filter((print) => print.foil);
  }
  if (etched) {
    prints_ = prints_.filter((print) => print.etched);
  }
  return prints_[0] ? prints_[0] : defaultPrint;
}

export function rawDeckToDeckListString(deck: RawCard[]): string {
  const cardCounts: { [key: string]: number } = {};

  deck.forEach((card) => {
    const key = `${card.name}|${card.set || ""}|${card.collectorNumber || ""}|${card.foil ? "F" : ""}|${card.etched ? "E" : ""}`;
    if (cardCounts[key]) {
      cardCounts[key]++;
    } else {
      cardCounts[key] = 1;
    }
  });

  return Object.entries(cardCounts)
    .map(([key, quantity]) => {
      const [name, set, collectorNumber, foil, etched] = key.split("|");
      let line = `${quantity} ${name}`;
      if (set) {
        line += ` (${set.toUpperCase()})`;
      }
      if (collectorNumber) {
        line += ` ${collectorNumber.toUpperCase()}`;
      }
      if (foil === "F") {
        line += ` *F*`;
      }
      if (etched === "E") {
        line += ` *E*`;
      }
      return line;
    })
    .join("\n");
}
