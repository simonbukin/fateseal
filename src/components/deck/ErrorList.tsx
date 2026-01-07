import { Button } from "@mantine/core";
import { useDeck } from "@/store/deckContext";
import { ErrorItem } from "./ErrorItem";
import type { CardError } from "@/utils/deck";

interface ErrorListProps {
  onFixError: (errorCard: CardError) => void;
  onFixAllErrors: () => void;
}

export function ErrorList({ onFixError, onFixAllErrors }: ErrorListProps) {
  const { state, hasFixableErrors } = useDeck();
  const { errorCards } = state;

  if (errorCards.length === 0) {
    return null;
  }

  const fixableCount = errorCards.filter((e) => e.fix).length;

  return (
    <div className="mt-3">
      {hasFixableErrors && fixableCount > 1 && (
        <Button
          onClick={onFixAllErrors}
          variant="gradient"
          gradient={{ from: "yellow", to: "orange", deg: 90 }}
          size="sm"
          className="mb-3"
        >
          Accept All Suggestions ({fixableCount})
        </Button>
      )}
      <ul className="space-y-2">
        {errorCards.map((errorCard, i) => (
          <ErrorItem
            key={errorCard.card.name + i}
            errorCard={errorCard}
            onFix={() => onFixError(errorCard)}
          />
        ))}
      </ul>
    </div>
  );
}
