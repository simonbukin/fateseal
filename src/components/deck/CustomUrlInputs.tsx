import { useEffect, useState } from "react";
import { TextInput, Alert, Text, Loader } from "@mantine/core";
import { useDeck } from "@/store/deckContext";

type ImageStatus = "idle" | "loading" | "loaded" | "error";

const MIN_IMAGE_SIZE = 50;

function useImageStatus(url: string): ImageStatus {
  const [status, setStatus] = useState<ImageStatus>("idle");

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      // Reject tiny images (likely error placeholders from CDNs)
      if (img.naturalWidth < MIN_IMAGE_SIZE || img.naturalHeight < MIN_IMAGE_SIZE) {
        setStatus("error");
      } else {
        setStatus("loaded");
      }
    };

    img.onerror = () => {
      if (!cancelled) setStatus("error");
    };

    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [url]);

  return status;
}

interface ImagePreviewProps {
  url: string;
  status: ImageStatus;
  alt: string;
}

function ImagePreview({ url, status, alt }: ImagePreviewProps) {
  if (!url) return null;

  return (
    <div className="mt-2">
      {status === "loading" && (
        <div className="flex items-center gap-2 py-2">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading image...
          </Text>
        </div>
      )}

      {status === "error" && (
        <Alert color="red" title="Failed to load image">
          <Text size="sm">
            The image URL could not be loaded. Please check that:
          </Text>
          <ul className="list-disc list-inside mt-1 text-sm">
            <li>The URL points directly to an image file</li>
            <li>The image is publicly accessible</li>
            <li>The URL is correct and complete</li>
          </ul>
        </Alert>
      )}

      {status === "loaded" && (
        <>
          <img
            src={url}
            alt={alt}
            className="max-w-full max-h-64 object-contain rounded-lg border border-gray-600"
          />
          <Text size="xs" c="dimmed" className="mt-2">
            For best results, use a 745x1040 pixel image (standard MTG card
            ratio). Mismatched aspect ratios may appear stretched in TTS.
          </Text>
        </>
      )}
    </div>
  );
}

export function CustomUrlInputs() {
  const { state, dispatch } = useDeck();

  const backImageStatus = useImageStatus(state.customBackUrl);
  const commanderImageStatus = useImageStatus(state.customCommanderUrl);

  useEffect(() => {
    dispatch({
      type: "SET_CUSTOM_BACK_ERROR",
      payload: backImageStatus === "error",
    });
  }, [backImageStatus, dispatch]);

  useEffect(() => {
    dispatch({
      type: "SET_COMMANDER_ERROR",
      payload: commanderImageStatus === "error",
    });
  }, [commanderImageStatus, dispatch]);

  return (
    <>
      <TextInput
        placeholder="https://example.com/path/to/your/image.jpg"
        value={state.customBackUrl}
        size="md"
        className="mt-4"
        label="Custom back image URL"
        description="Optional: Use a custom card back for all cards in your deck"
        onChange={(e) =>
          dispatch({ type: "SET_CUSTOM_BACK_URL", payload: e.target.value })
        }
        error={backImageStatus === "error"}
      />
      <ImagePreview
        url={state.customBackUrl}
        status={backImageStatus}
        alt="Custom back preview"
      />

      <TextInput
        placeholder="https://example.com/path/to/your/commander.jpg"
        value={state.customCommanderUrl}
        size="md"
        className="mt-4"
        label="Custom Commander URL"
        description="Optional: Add a custom commander card to your deck"
        onChange={(e) =>
          dispatch({ type: "SET_CUSTOM_COMMANDER_URL", payload: e.target.value })
        }
        error={commanderImageStatus === "error"}
      />
      <ImagePreview
        url={state.customCommanderUrl}
        status={commanderImageStatus}
        alt="Custom commander preview"
      />
    </>
  );
}
