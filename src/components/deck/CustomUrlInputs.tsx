import { TextInput } from "@mantine/core";
import { useDeck } from "@/store/deckContext";

export function CustomUrlInputs() {
  const { state, dispatch } = useDeck();

  return (
    <>
      <TextInput
        placeholder="https://example.com/path/to/your/image.jpg"
        value={state.customBackUrl}
        size="md"
        className="mt-4"
        label="Custom back image URL"
        description="Optional: Provide a URL to your custom back image"
        onChange={(e) =>
          dispatch({ type: "SET_CUSTOM_BACK_URL", payload: e.target.value })
        }
      />
      {state.customBackUrl && (
        <>
          <img
            src={state.customBackUrl}
            alt="Custom back preview"
            className="mt-2 max-w-full max-h-64 object-contain rounded-lg"
            onError={() =>
              dispatch({ type: "SET_CUSTOM_BACK_ERROR", payload: true })
            }
          />
          {state.customBackError && (
            <p className="text-red-500 mt-1">
              Failed to load image. Please check the URL.
            </p>
          )}
        </>
      )}

      <TextInput
        placeholder="https://example.com/path/to/your/commander.jpg"
        value={state.customCommanderUrl}
        size="md"
        className="mt-4"
        label="Custom Commander URL"
        description="Optional: Provide a URL to your custom commander image"
        onChange={(e) =>
          dispatch({ type: "SET_CUSTOM_COMMANDER_URL", payload: e.target.value })
        }
      />
      {state.customCommanderUrl && (
        <>
          <img
            src={state.customCommanderUrl}
            alt="Custom commander preview"
            className="mt-2 max-w-full max-h-64 object-contain rounded-lg"
            onError={() =>
              dispatch({ type: "SET_COMMANDER_ERROR", payload: true })
            }
          />
          {state.commanderError && (
            <p className="text-red-500 mt-1">
              Failed to load commander image. Please check the URL.
            </p>
          )}
        </>
      )}
    </>
  );
}
