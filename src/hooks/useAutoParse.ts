import { useEffect, useRef, useCallback, type Dispatch } from "react";
import Fuse from "fuse.js";
import { notifications } from "@mantine/notifications";
import type { CardData } from "@/services/cardDatabase";
import type { DeckAction } from "@/store/types";
import { parseDeckList, decklistToCards } from "@/utils/deck";

interface UseAutoParseOptions {
  debounceMs?: number;
  minLength?: number;
  enabled?: boolean;
}

export function useAutoParse(
  deckList: string,
  customCommanderUrl: string,
  cardData: CardData | null,
  fuse: Fuse<string> | null,
  dispatch: Dispatch<DeckAction>,
  options: UseAutoParseOptions = {}
): { parseNow: () => void } {
  const { debounceMs = 400, minLength = 3, enabled = true } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevCardCountRef = useRef(0);
  const hasShownMobileNotificationRef = useRef(false);

  const parse = useCallback(() => {
    if (!cardData || !fuse || !enabled) return;

    const trimmed = deckList.trim();
    if (trimmed.length < minLength) {
      // Clear results if input too short
      dispatch({
        type: "PARSE_COMPLETE",
        payload: { rawDeck: [], cards: [], extras: [], errorCards: [] },
      });
      return;
    }

    const lines = deckList.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
      dispatch({
        type: "PARSE_COMPLETE",
        payload: { rawDeck: [], cards: [], extras: [], errorCards: [] },
      });
      return;
    }

    try {
      const parsedDecklist = parseDeckList(lines);
      const { resultingCards, extraCards, errorCards } = decklistToCards(
        parsedDecklist,
        cardData
      );

      // Add custom commander if URL provided
      if (customCommanderUrl) {
        resultingCards.unshift({
          id: "custom-commander",
          name: "Custom Commander",
          images: { front: customCommanderUrl },
        });
      }

      // Populate fix suggestions for errors
      errorCards.forEach((errorCard) => {
        const result = fuse.search(errorCard.card.name)[0];
        errorCard.fix = result?.item;
      });

      dispatch({
        type: "PARSE_COMPLETE",
        payload: {
          rawDeck: parsedDecklist,
          cards: resultingCards,
          extras: extraCards,
          errorCards,
        },
      });

      // Show mobile notification when cards first load
      const isMobile = window.innerWidth < 768;
      const hadNoCards = prevCardCountRef.current === 0;
      const hasCardsNow = resultingCards.length > 0;

      if (isMobile && hadNoCards && hasCardsNow && !hasShownMobileNotificationRef.current) {
        hasShownMobileNotificationRef.current = true;
        notifications.show({
          message: "Deck loaded! Scroll down to see your cards",
          color: "blue",
          autoClose: 3000,
        });
      }

      prevCardCountRef.current = resultingCards.length;
    } catch (error) {
      console.error("Parse error:", error);
    }
  }, [deckList, customCommanderUrl, cardData, fuse, dispatch, enabled, minLength]);

  // Debounced parse effect
  useEffect(() => {
    if (!enabled || !cardData) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(parse, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [parse, debounceMs, enabled, cardData]);

  // Return immediate parse function for manual triggering
  return { parseNow: parse };
}
