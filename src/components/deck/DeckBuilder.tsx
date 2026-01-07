import { useCallback, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useDeck } from "@/store/deckContext";
import { useCardDatabase } from "@/hooks/useCardDatabase";
import { useAutoParse } from "@/hooks/useAutoParse";
import { DeckNameInput } from "./DeckNameInput";
import { DeckListTextarea } from "./DeckListTextarea";
import { CustomUrlInputs } from "./CustomUrlInputs";
import { ErrorList } from "./ErrorList";
import { ExportButton } from "./ExportButton";
import { CardGrid } from "@/components/cards/CardGrid";
import CardSelector from "@/components/CardSelector";
import {
  parseDeckList,
  decklistToCards,
  rawDeckToDeckListString,
  type CardError,
} from "@/utils/deck";
import type { BasicCard, Print } from "@/types/cards";
import type { CardData } from "@/services/cardDatabase";

export function DeckBuilder() {
  const { state, dispatch } = useDeck();
  const { data: cardData, fuse, loading, isFirstLoad, progress } = useCardDatabase();

  // Auto-parse as user types (400ms debounce)
  useAutoParse(
    state.deckList,
    state.customCommanderUrl,
    cardData,
    fuse,
    dispatch,
    { enabled: !loading }
  );

  // Fix a single error
  const handleFixError = useCallback(
    (errorCard: CardError) => {
      if (!errorCard.fix || !cardData || !fuse) return;

      const lines = state.deckList.split("\n").filter((line) => line.length !== 0);
      const decklist = parseDeckList(lines);

      // Apply fix to decklist
      const fixedDecklist = decklist.map((card) => {
        if (card.name.toLowerCase() === errorCard.card.name.toLowerCase()) {
          return { ...card, name: errorCard.fix! };
        }
        return card;
      });

      const newDeckList = rawDeckToDeckListString(fixedDecklist);
      const { resultingCards, extraCards, errorCards: newErrorCards } =
        decklistToCards(fixedDecklist, cardData);

      // Add custom commander if URL provided
      if (state.customCommanderUrl) {
        resultingCards.unshift({
          id: "custom-commander",
          name: "Custom Commander",
          images: { front: state.customCommanderUrl },
        });
      }

      // Populate fix suggestions for remaining errors
      newErrorCards.forEach((e) => {
        const result = fuse.search(e.card.name)[0];
        e.fix = result?.item;
      });

      dispatch({
        type: "PARSE_COMPLETE",
        payload: {
          rawDeck: fixedDecklist,
          cards: resultingCards,
          extras: extraCards,
          errorCards: newErrorCards,
          updatedDeckList: newDeckList,
        },
      });

      notifications.show({
        message: `Fixed "${errorCard.card.name}" → "${errorCard.fix}"`,
        color: "green",
        autoClose: 2000,
      });
    },
    [cardData, fuse, state.deckList, state.customCommanderUrl, dispatch]
  );

  // Fix all errors at once
  const handleFixAllErrors = useCallback(() => {
    if (!cardData || !fuse) return;

    const fixableErrors = state.errorCards.filter((e) => e.fix);
    if (fixableErrors.length === 0) return;

    const lines = state.deckList.split("\n").filter((line) => line.length !== 0);
    let decklist = parseDeckList(lines);

    // Apply all fixes
    fixableErrors.forEach((errorCard) => {
      decklist = decklist.map((card) => {
        if (card.name.toLowerCase() === errorCard.card.name.toLowerCase()) {
          return { ...card, name: errorCard.fix! };
        }
        return card;
      });
    });

    const newDeckList = rawDeckToDeckListString(decklist);
    const { resultingCards, extraCards, errorCards: newErrorCards } =
      decklistToCards(decklist, cardData);

    // Add custom commander if URL provided
    if (state.customCommanderUrl) {
      resultingCards.unshift({
        id: "custom-commander",
        name: "Custom Commander",
        images: { front: state.customCommanderUrl },
      });
    }

    // Populate fix suggestions for remaining errors
    newErrorCards.forEach((e) => {
      const result = fuse.search(e.card.name)[0];
      e.fix = result?.item;
    });

    dispatch({
      type: "FIX_ALL_ERRORS",
      payload: {
        newDeckList,
        cards: resultingCards,
        extras: extraCards,
        errorCards: newErrorCards,
      },
    });

    notifications.show({
      message: `Fixed ${fixableErrors.length} card${fixableErrors.length > 1 ? "s" : ""}`,
      color: "green",
      autoClose: 2000,
    });
  }, [cardData, fuse, state.deckList, state.errorCards, state.customCommanderUrl, dispatch]);

  // Handle card click to open selector
  const handleCardClick = useCallback(
    (card: BasicCard, index: number) => {
      if (card.name === "Custom Commander") return;
      dispatch({
        type: "OPEN_SELECTOR",
        payload: { cardName: card.name, index },
      });
    },
    [dispatch]
  );

  // Handle printing selection
  const handlePrintingSelect = useCallback(
    (print: Print) => {
      if (state.selector.cardIndex === null) return;

      const newCards = [...state.cards];
      newCards[state.selector.cardIndex] = {
        ...newCards[state.selector.cardIndex],
        images: print.images,
        foil: print.foil,
        etched: print.etched,
      };

      const newRawDeck = [...state.rawDeck];
      newRawDeck[state.selector.cardIndex] = {
        ...newRawDeck[state.selector.cardIndex],
        set: print.set,
        collectorNumber: print.collectorNumber,
        foil: print.foil,
        etched: print.etched,
      };

      const newDeckList = rawDeckToDeckListString(newRawDeck);

      dispatch({
        type: "SELECT_PRINTING",
        payload: {
          print,
          index: state.selector.cardIndex,
          newCards,
          newRawDeck,
          newDeckList,
        },
      });
    },
    [state.cards, state.rawDeck, state.selector.cardIndex, dispatch]
  );

  // Keyboard shortcut for export
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        // Trigger export via button click simulation or direct call
        const exportBtn = document.querySelector(
          'button[class*="gradient"][class*="cyan"]'
        ) as HTMLButtonElement | null;
        if (exportBtn && !exportBtn.disabled) {
          exportBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full">
      <DeckNameInput />
      <DeckListTextarea
        loading={loading}
        isFirstLoad={isFirstLoad}
        progress={progress}
      />
      <CustomUrlInputs />
      <ErrorList onFixError={handleFixError} onFixAllErrors={handleFixAllErrors} />

      <ExportButton />

      <CardSelector
        isOpen={state.selector.isOpen}
        onClose={() => dispatch({ type: "CLOSE_SELECTOR" })}
        cardName={state.selector.cardName}
        cardData={cardData as CardData | undefined}
        onSelectPrinting={handlePrintingSelect}
      />

      <CardGrid onCardClick={handleCardClick} />
    </div>
  );
}
