import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  type Dispatch,
} from "react";
import { deckReducer, initialState } from "./deckReducer";
import type { DeckState, DeckAction } from "./types";

interface DeckContextValue {
  state: DeckState;
  dispatch: Dispatch<DeckAction>;
  // Derived selectors
  cardCount: number;
  tokenCount: number;
  errorCount: number;
  hasFixableErrors: boolean;
  canExport: boolean;
}

const DeckContext = createContext<DeckContextValue | null>(null);

interface DeckProviderProps {
  children: ReactNode;
}

export function DeckProvider({ children }: DeckProviderProps) {
  const [state, dispatch] = useReducer(deckReducer, initialState);

  const value = useMemo<DeckContextValue>(
    () => ({
      state,
      dispatch,
      cardCount: state.cards.length,
      tokenCount: state.extras.length,
      errorCount: state.errorCards.length,
      hasFixableErrors: state.errorCards.some((e) => e.fix),
      canExport: state.cards.length > 0,
    }),
    [state]
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck(): DeckContextValue {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error("useDeck must be used within a DeckProvider");
  }
  return context;
}
