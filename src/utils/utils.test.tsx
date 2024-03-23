import { expect, it, describe } from "vitest";
import wubrgFateseal from "./wubrgFateseal.json";
import wubrgFrogtown from "./wubrgFrogtown.json";

import { parseLine } from "./deck";
import {
  type CustomDeckObject,
  generateDeckIds,
  cardToCustomDeckObject,
  ContainedObject,
  DEFAULT_TRANSFORM_OPTIONS,
  cardToContainedObject,
  deckToObjects,
} from "./ttExport";
import { BasicCard, RawCard } from "@/types/cards";

const adelineScryfall: BasicCard = {
  name: "Adeline, Resplendent Cathar",
  imageUrl:
    "https://cards.scryfall.io/large/front/d/d/dd95d377-a61e-4b62-a883-ed491c48da15.jpg?1682208250",
};

describe("ttExport.tsx", () => {
  describe("generateDeckIds", () => {
    it("errors on non-positive input", () => {
      expect(() => {
        generateDeckIds(-1);
      }).toThrow();
    });
    it("generates deckIds for single id", () => {
      expect(generateDeckIds(1)).toEqual([100]);
    });
    it("generated deckIds for multiple ids", () => {
      expect(generateDeckIds(10)).toEqual([
        100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
      ]);
    });
  });
  describe("cardToCustomDeckObject", () => {
    const adelineCustomDeckObject: CustomDeckObject = {
      FaceURL:
        "https://cards.scryfall.io/large/front/d/d/dd95d377-a61e-4b62-a883-ed491c48da15.jpg?1682208250",
      BackURL: "https://i.imgur.com/Hg8CwwU.jpeg",
      NumHeight: 1,
      NumWidth: 1,
      BackIsHidden: true,
    };
    it("works on a given card", () => {
      expect(cardToCustomDeckObject(adelineScryfall)).toEqual(
        adelineCustomDeckObject
      );
    });
  });
  describe("cardToContainedObject", () => {
    const adelineContainedObject: ContainedObject = {
      CardID: 100,
      Name: "Card",
      Nickname: "Adeline, Resplendent Cathar",
      Transform: DEFAULT_TRANSFORM_OPTIONS,
    };
    it("works on a given card", () => {
      expect(cardToContainedObject(adelineScryfall, 100)).toEqual(
        adelineContainedObject
      );
    });
  });
  // describe("deckToObjects", () => {
  // it("matches the format of a Frogtown exported deck on a single card", () => {
  //   expect(deckToObjects(wubrgFateseal)).toEqual(wubrgFrogtown);
  // });
  // });
});
describe("deck.tsx", () => {
  describe("parseLine", () => {
    it("a card line is parsed properly", () => {
      const mountainObject: RawCard = {
        quantity: 6,
        name: "Mountain",
      };
      const parsedLine = parseLine("6 Mountain");
      expect(parsedLine).toEqual(
        Array.from({ length: 6 })
          .map(() => mountainObject)
          .flat()
      );
    });
    it("a negative quantity errors", () => {
      expect(() => {
        parseLine("-1 Mountain");
      }).toThrow();
    });
    it("a zero quantity errors", () => {
      expect(() => {
        parseLine("0 Mountain");
      }).toThrow();
    });
    it("a blank line errors", () => {
      expect(() => {
        parseLine("");
      }).toThrow();
    });
    it("a card line with a set name is parsed properly", () => {
      const mountainObject: RawCard = {
        quantity: 6,
        name: "Mountain",
        set: "tsp",
      };
      const parsedLine = parseLine("6 Mountain (TSP)");
      expect(parsedLine).toEqual(
        Array.from({ length: 6 })
          .map(() => mountainObject)
          .flat()
      );
    });
    it("parses a name, quantity, set name, and collector number", () => {
      const mountainObject: RawCard = {
        quantity: 6,
        name: "Mountain",
        set: "tsp",
        collectorNumber: "295",
      };
      const parsedLine = parseLine("6 Mountain (TSP) 295");
      expect(parsedLine).toEqual(
        Array.from({ length: 6 })
          .map(() => mountainObject)
          .flat()
      );
    });
    it("parses a multi-word name, quantity, set name, and collector number", () => {
      const darkslickShoresObject: RawCard = {
        quantity: 1,
        name: "Darkslick Shores",
        set: "one",
        collectorNumber: "250",
      };
      const parsedLine = parseLine("1 Darkslick Shores (ONE) 250");
      expect(parsedLine).toEqual(
        Array.from({ length: 1 })
          .map(() => darkslickShoresObject)
          .flat()
      );
    });
    it("parses a multi-word name on its own", () => {
      const darkslickShoresObject: RawCard = {
        quantity: 1,
        name: "Darkslick Shores",
      };
      const parsedLine = parseLine("1 Darkslick Shores");
      expect(parsedLine).toEqual(
        Array.from({ length: 1 })
          .map(() => darkslickShoresObject)
          .flat()
      );
    });
    it("filters out etchings", () => {
      const arcaneSignetObject: RawCard = {
        quantity: 1,
        name: "Arcane Signet",
        set: "sld",
        collectorNumber: "1492★",
      };
      const parsedLine = parseLine("1 Arcane Signet (SLD) 1492★ *F*");
      expect(parsedLine).toEqual(
        Array.from({ length: 1 })
          .map(() => arcaneSignetObject)
          .flat()
      );
    });
    it("filters out foils", () => {
      const arcaneSignetObject: RawCard = {
        quantity: 1,
        name: "Arcane Signet",
        set: "sld",
        collectorNumber: "1492★",
      };
      const parsedLine = parseLine("1 Arcane Signet (SLD) 1492★ *E*");
      expect(parsedLine).toEqual(
        Array.from({ length: 1 })
          .map(() => arcaneSignetObject)
          .flat()
      );
    });
  });
});
