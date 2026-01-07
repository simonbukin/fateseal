import { Button } from "@mantine/core";
import { useDeck } from "@/store/deckContext";
import { deckToObjects } from "@/utils/ttExport";
import { notifications } from "@mantine/notifications";

export function ExportButton() {
  const { state, canExport } = useDeck();

  function handleExport() {
    if (state.cards.length === 0) return;

    try {
      const deck = deckToObjects(state.cards, state.extras, state.customBackUrl);
      const blob = new Blob([JSON.stringify(deck, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.deckName || "fateseal"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: "Export successful",
        message: `Downloaded ${state.deckName || "fateseal"}.json`,
        color: "green",
        autoClose: 3000,
      });
    } catch (error) {
      notifications.show({
        title: "Export failed",
        message: "An error occurred while exporting the deck",
        color: "red",
        autoClose: 5000,
      });
      console.error("Export error:", error);
    }
  }

  return (
    <Button
      disabled={!canExport}
      className="my-4 mb-8"
      onClick={handleExport}
      fullWidth
      variant="gradient"
      gradient={{ from: "indigo", to: "cyan", deg: 90 }}
      color="purple"
      size="md"
    >
      Export (Ctrl+E)
    </Button>
  );
}
