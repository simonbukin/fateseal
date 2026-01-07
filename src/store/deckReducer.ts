import type { DeckState, DeckAction } from "./types";

export const initialState: DeckState = {
  deckName: "",
  deckList: "",
  customBackUrl: "",
  customCommanderUrl: "",
  rawDeck: [],
  cards: [],
  extras: [],
  errorCards: [],
  customBackError: false,
  commanderError: false,
  selector: {
    isOpen: false,
    cardName: null,
    cardIndex: null,
  },
};

export function deckReducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case "SET_DECK_NAME":
      return { ...state, deckName: action.payload };

    case "SET_DECK_LIST":
      return { ...state, deckList: action.payload };

    case "SET_CUSTOM_BACK_URL":
      return {
        ...state,
        customBackUrl: action.payload,
        customBackError: false,
      };

    case "SET_CUSTOM_COMMANDER_URL":
      return {
        ...state,
        customCommanderUrl: action.payload,
        commanderError: false,
      };

    case "SET_CUSTOM_BACK_ERROR":
      return { ...state, customBackError: action.payload };

    case "SET_COMMANDER_ERROR":
      return { ...state, commanderError: action.payload };

    case "PARSE_COMPLETE":
      return {
        ...state,
        rawDeck: action.payload.rawDeck,
        cards: action.payload.cards,
        extras: action.payload.extras,
        errorCards: action.payload.errorCards,
        deckList: action.payload.updatedDeckList ?? state.deckList,
      };

    case "FIX_ERROR": {
      // Remove the fixed error from the error list
      const remainingErrors = state.errorCards.filter(
        (e) =>
          e.card.name.toLowerCase() !==
          action.payload.errorCard.card.name.toLowerCase()
      );
      return {
        ...state,
        errorCards: remainingErrors,
        deckList: action.payload.newDeckList,
      };
    }

    case "FIX_ALL_ERRORS":
      return {
        ...state,
        deckList: action.payload.newDeckList,
        cards: action.payload.cards,
        extras: action.payload.extras,
        errorCards: action.payload.errorCards,
      };

    case "SELECT_PRINTING":
      return {
        ...state,
        cards: action.payload.newCards,
        rawDeck: action.payload.newRawDeck,
        deckList: action.payload.newDeckList,
        selector: {
          isOpen: false,
          cardName: null,
          cardIndex: null,
        },
      };

    case "OPEN_SELECTOR":
      return {
        ...state,
        selector: {
          isOpen: true,
          cardName: action.payload.cardName,
          cardIndex: action.payload.index,
        },
      };

    case "CLOSE_SELECTOR":
      return {
        ...state,
        selector: {
          isOpen: false,
          cardName: null,
          cardIndex: null,
        },
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
