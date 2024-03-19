import { ScryfallCard } from "./deck";

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

export function deckToObjects(deck: ScryfallCard[]): CustomDeck {
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
  return {
    Name: "DeckCustom",
    ContainedObjects: containedObjects,
    DeckIDs: deckIds,
    CustomDeck: customDeck,
    Transform: customDeckTransform,
  };
}

export function generateDeckIds(totalIds: number): number[] {
  if (totalIds <= 0) {
    throw new RangeError("totalIds must be positive");
  }
  return Array.from({ length: totalIds }).map(
    (item, index) => (index + 1) * 100,
  );
}

export function cardToCustomDeckObject(
  card: ScryfallCard,
): CustomDeckObject {
  return {
    FaceURL: card.imageUrl,
    BackURL: "https://i.imgur.com/Hg8CwwU.jpeg",
    NumHeight: 1,
    NumWidth: 1,
    BackIsHidden: true,
  };
}

export function cardToContainedObject(
  card: ScryfallCard,
  id: number,
): ContainedObject {
  return {
    CardID: id,
    Name: "Card",
    Nickname: card.name,
    Transform: DEFAULT_TRANSFORM_OPTIONS,
  };
}
