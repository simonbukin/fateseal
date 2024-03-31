import { BasicCard } from "@/types/cards";

export type FullDeckExport = {
  ObjectStates: CustomDeck[];
};

export type CustomDeck = {
  Name: string;
  ContainedObjects: ContainedObject[];
  DeckIDs: number[];
  CustomDeck: CustomDeckObjectMap;
  Transform: TransformOptions;
};

export type ContainedObject = {
  CardID: number;
  Name: "Card";
  Nickname: string;
  Transform: TransformOptions;
};

export type CustomDeckObject = {
  FaceURL: string;
  BackURL: string;
  NumHeight: 1;
  NumWidth: 1;
  BackIsHidden: true;
};

export type CustomDeckObjectMap = {
  [key: string]: CustomDeckObject;
};

export type TransformOptions = {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
};

export const DEFAULT_TRANSFORM_OPTIONS: TransformOptions = {
  posX: 0,
  posY: 0,
  posZ: 0,
  rotX: 0,
  rotY: 180,
  rotZ: 180,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
};

export function deckToObjects(
  deck: BasicCard[],
  extraCardsDeck?: BasicCard[]
): FullDeckExport {
  const customDeckTransform: TransformOptions = {
    ...DEFAULT_TRANSFORM_OPTIONS,
    posY: 1,
  };

  const containedObjects: ContainedObject[] = deck.map((card, index) => {
    return cardToContainedObject(card, (index + 1) * 100);
  });
  const deckIds = generateDeckIds(deck.length);
  const customDeck: CustomDeckObjectMap = {};
  for (let i = 0; i < deck.length; i++) {
    customDeck[`${i + 1}`] = cardToCustomDeckObject(deck[i]);
  }
  const normalCards: CustomDeck = {
    Name: "DeckCustom",
    CustomDeck: customDeck,
    DeckIDs: deckIds,
    Transform: customDeckTransform,
    ContainedObjects: containedObjects,
  };

  let containedExtraObjects: ContainedObject[] = [];
  let extraDeckIds: number[] = [];
  let extraCardsCustomDeck: CustomDeckObjectMap = {};
  if (extraCardsDeck) {
    containedExtraObjects = extraCardsDeck.map((card, index) => {
      return cardToContainedObject(card, (index + 1) * 100);
    });
    extraDeckIds = generateDeckIds(extraCardsDeck.length);
    for (let i = 0; i < extraCardsDeck.length; i++) {
      extraCardsCustomDeck[`${i + 1}`] = cardToCustomDeckObject(
        extraCardsDeck[i]
      );
    }
  }
  const extraCards: CustomDeck = {
    Name: "DeckCustom",
    CustomDeck: extraCardsCustomDeck,
    DeckIDs: extraDeckIds,
    Transform: { ...DEFAULT_TRANSFORM_OPTIONS, posX: 2.2, posY: 1, rotZ: 0 },
    ContainedObjects: containedExtraObjects,
  };

  const transformDeck = deck.filter((card) => card.images.back);
  let transformContainedObjects: ContainedObject[] = [];
  let transformDeckIds: number[] = [];
  let transformCustomDeck: CustomDeckObjectMap = {};
  if (transformDeck.length > 0) {
    transformContainedObjects = transformDeck.map((card, index) => {
      return cardToContainedObject(card, (index + 1) * 100);
    });
    transformDeckIds = generateDeckIds(transformDeck.length);
    transformCustomDeck = {};
    for (let i = 0; i < transformDeck.length; i++) {
      transformCustomDeck[`${i + 1}`] = cardToCustomDeckObject(
        transformDeck[i],
        {
          useBackFace: true,
        }
      );
    }
  }
  const transformCards: CustomDeck = {
    Name: "DeckCustom",
    CustomDeck: transformCustomDeck,
    DeckIDs: transformDeckIds,
    Transform: { ...DEFAULT_TRANSFORM_OPTIONS, posX: 2.2, posY: 1, rotZ: 0 },
    ContainedObjects: transformContainedObjects,
  };

  const objectStates = [normalCards];
  if (transformDeck.length > 0) {
    objectStates.push(transformCards);
  }
  if (extraCardsDeck && extraCardsDeck.length > 0) {
    objectStates.push(extraCards);
  }

  return {
    ObjectStates: objectStates,
  };
}

export function generateDeckIds(totalIds: number): number[] {
  if (totalIds <= 0) {
    throw new RangeError("totalIds must be positive");
  }
  return Array.from({ length: totalIds }).map(
    (item, index) => (index + 1) * 100
  );
}

export function cardToCustomDeckObject(
  card: BasicCard,
  config?: {
    useBackFace: boolean;
  }
): CustomDeckObject {
  const hasBackFace = Boolean(card.images.back);
  const backFace = card.images.back;

  return {
    FaceURL: card.images.front || "",
    BackURL:
      (config?.useBackFace
        ? hasBackFace
          ? backFace
          : "https://i.imgur.com/Hg8CwwU.jpeg"
        : "https://i.imgur.com/Hg8CwwU.jpeg") || "",
    NumHeight: 1,
    NumWidth: 1,
    BackIsHidden: true,
  };
}

export function cardToContainedObject(
  card: BasicCard,
  id: number
): ContainedObject {
  return {
    CardID: id,
    Name: "Card",
    Nickname: card.name,
    Transform: DEFAULT_TRANSFORM_OPTIONS,
  };
}
