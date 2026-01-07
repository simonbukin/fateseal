import { Button } from "@mantine/core";
import type { CardError } from "@/utils/deck";

interface ErrorItemProps {
  errorCard: CardError;
  onFix: () => void;
}

export function ErrorItem({ errorCard, onFix }: ErrorItemProps) {
  const message = errorCard.fix
    ? `No match found for "${errorCard.card.name}". Did you mean "${errorCard.fix}"?`
    : `Could not find a match for "${errorCard.card.name}". ${errorCard.error}`;

  return (
    <li className="flex flex-row gap-2 justify-between items-center">
      <p className="text-red-500">{message}</p>
      {errorCard.fix && (
        <Button
          onClick={onFix}
          variant="gradient"
          gradient={{ from: "yellow", to: "orange", deg: 90 }}
          size="md"
          className="shrink-0"
        >
          Yep
        </Button>
      )}
    </li>
  );
}
