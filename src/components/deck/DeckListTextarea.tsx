import { Box, LoadingOverlay, Textarea, Progress } from "@mantine/core";
import { useDeck } from "@/store/deckContext";
import { LastUpdated } from "@/components/LastUpdated";
import { LiveStats } from "./LiveStats";

interface DeckListTextareaProps {
  loading: boolean;
  isFirstLoad: boolean;
  progress: number;
}

export function DeckListTextarea({
  loading,
  isFirstLoad,
  progress,
}: DeckListTextareaProps) {
  const { state, dispatch, cardCount, tokenCount, errorCount } = useDeck();

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={loading}
        zIndex={10}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{
          children: isFirstLoad ? (
            <div className="text-center w-64">
              <div className="mb-4">Downloading card database...</div>
              <Progress
                value={progress}
                size="lg"
                radius="xl"
                striped
                animated={progress < 100}
              />
              <div className="text-sm text-gray-500 mt-2">
                This only happens once ({Math.round(progress)}%)
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-2">Loading card database...</div>
              <div className="text-sm text-gray-500">This may take a moment</div>
            </div>
          ),
        }}
      />
      <Textarea
        value={state.deckList}
        onChange={(e) =>
          dispatch({ type: "SET_DECK_LIST", payload: e.target.value })
        }
        size="md"
        autosize
        disabled={loading}
        minRows={5}
        maxRows={15}
        label={
          <LiveStats
            cardCount={cardCount}
            tokenCount={tokenCount}
            errorCount={errorCount}
          />
        }
        description="Paste your decklist below, in the MTGO format. You can include a set name and collector number as well."
        placeholder={`1 Imperial Recruiter\n2 Mountain (SLD) 1193\n• • • `}
      />
      <LastUpdated />
    </Box>
  );
}
