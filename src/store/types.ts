import type { BasicCard, RawCard, Print } from "@/types/cards";
import type { CardError } from "@/utils/deck";

export interface DeckState {
  // Input state
  deckName: string;
  deckList: string;
  customBackUrl: string;
  customCommanderUrl: string;

  // Parsed state
  rawDeck: RawCard[];
  cards: BasicCard[];
  extras: BasicCard[];
  errorCards: CardError[];

  // URL validation state
  customBackError: boolean;
  commanderError: boolean;

  // Modal state
  selector: {
    isOpen: boolean;
    cardName: string | null;
    cardIndex: number | null;
  };
}

export type DeckAction =
  | { type: "SET_DECK_NAME"; payload: string }
  | { type: "SET_DECK_LIST"; payload: string }
  | { type: "SET_CUSTOM_BACK_URL"; payload: string }
  | { type: "SET_CUSTOM_COMMANDER_URL"; payload: string }
  | { type: "SET_CUSTOM_BACK_ERROR"; payload: boolean }
  | { type: "SET_COMMANDER_ERROR"; payload: boolean }
  | {
      type: "PARSE_COMPLETE";
      payload: {
        rawDeck: RawCard[];
        cards: BasicCard[];
        extras: BasicCard[];
        errorCards: CardError[];
        updatedDeckList?: string;
      };
    }
  | { type: "FIX_ERROR"; payload: { errorCard: CardError; newDeckList: string } }
  | {
      type: "FIX_ALL_ERRORS";
      payload: { newDeckList: string; cards: BasicCard[]; extras: BasicCard[]; errorCards: CardError[] };
    }
  | {
      type: "SELECT_PRINTING";
      payload: {
        print: Print;
        index: number;
        newCards: BasicCard[];
        newRawDeck: RawCard[];
        newDeckList: string;
      };
    }
  | { type: "OPEN_SELECTOR"; payload: { cardName: string; index: number } }
  | { type: "CLOSE_SELECTOR" }
  | { type: "RESET" };
