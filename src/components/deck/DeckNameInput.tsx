import { TextInput } from "@mantine/core";
import { useDeck } from "@/store/deckContext";

export function DeckNameInput() {
  const { state, dispatch } = useDeck();

  return (
    <TextInput
      placeholder="Deck name"
      value={state.deckName}
      size="md"
      className="mb-4"
      label="Your deck's name"
      onChange={(e) =>
        dispatch({ type: "SET_DECK_NAME", payload: e.target.value })
      }
    />
  );
}
