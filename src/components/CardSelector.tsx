import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Modal, ScrollArea, SimpleGrid, TextInput, Text, Badge } from "@mantine/core";
import { Search } from "lucide-react";
import { FatesealCard, Print } from "@/types/cards";
import MTGCard from "./MTGCard";

type CardSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  cardName: string | null;
  cardData: { [card: string]: FatesealCard } | undefined;
  onSelectPrinting: (print: Print) => void;
};

export function CardSelector({
  isOpen,
  onClose,
  cardName,
  cardData,
  onSelectPrinting,
}: CardSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset search when modal opens/closes or card changes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setFocusedIndex(0);
      // Focus search input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, cardName]);

  const card = cardData && cardName ? cardData[cardName] : null;

  // Filter prints by search query
  const filteredPrints = useMemo(() => {
    if (!card) return [];
    if (!searchQuery.trim()) return card.prints;

    const query = searchQuery.toLowerCase();
    return card.prints.filter(
      (print) =>
        print.set.toLowerCase().includes(query) ||
        print.collectorNumber.toLowerCase().includes(query)
    );
  }, [card, searchQuery]);

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery]);

  const handleSelect = useCallback(
    (print: Print) => {
      onSelectPrinting(print);
      onClose();
    },
    [onSelectPrinting, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const cols = window.innerWidth < 640 ? 2 : window.innerWidth < 768 ? 3 : 4;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((i) =>
            Math.min(i + cols, filteredPrints.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - cols, 0));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, filteredPrints.length - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredPrints[focusedIndex]) {
            handleSelect(filteredPrints[focusedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredPrints, focusedIndex, handleSelect, onClose]
  );

  if (!isOpen || !cardName || !cardData || !card) {
    return null;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Select a printing for ${cardName}`}
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
      onKeyDown={handleKeyDown}
    >
      <TextInput
        ref={searchInputRef}
        placeholder="Search by set code or collector number..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        leftSection={<Search size={16} />}
        mb="md"
      />

      {filteredPrints.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No printings match "{searchQuery}"
        </Text>
      ) : (
        <SimpleGrid
          cols={{ base: 2, sm: 3, md: 4 }}
          spacing="md"
          verticalSpacing="md"
        >
          {filteredPrints.map((print, index) => (
            <div
              key={print.id}
              onClick={() => handleSelect(print)}
              className={`cursor-pointer rounded-lg p-1 transition-all ${
                index === focusedIndex
                  ? "ring-2 ring-purple-500 ring-offset-2"
                  : "hover:ring-2 hover:ring-gray-300"
              }`}
            >
              <MTGCard
                card={{
                  id: `preview-${print.id}`,
                  name: card.name,
                  images: print.images,
                  foil: print.foil,
                  etched: print.etched,
                }}
              />
              <div className="mt-2 flex items-center justify-center gap-1 flex-wrap">
                <Text size="xs" c="dimmed">
                  {print.set.toUpperCase()} #{print.collectorNumber}
                </Text>
                {print.foil && (
                  <Badge size="xs" color="yellow" variant="light">
                    Foil
                  </Badge>
                )}
                {print.etched && (
                  <Badge size="xs" color="blue" variant="light">
                    Etched
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </SimpleGrid>
      )}

      <Text size="xs" c="dimmed" ta="center" mt="md">
        Use arrow keys to navigate, Enter to select, Escape to close
      </Text>
    </Modal>
  );
}

export default CardSelector;
