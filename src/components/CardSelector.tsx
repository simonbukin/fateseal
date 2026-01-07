"use client";

import { Modal, ScrollArea, SimpleGrid } from "@mantine/core";
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
  if (!isOpen || !cardName || !cardData) {
    return null;
  }

  const card = cardData[cardName];
  if (!card) return null;

  const handleSelect = (print: Print) => {
    onSelectPrinting(print);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Select a printing for ${cardName}`}
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <SimpleGrid
        cols={{ base: 2, sm: 3, md: 4 }}
        spacing="md"
        verticalSpacing="md"
      >
        {card.prints.map((print) => (
          <div
            key={print.id}
            onClick={() => handleSelect(print)}
            className="cursor-pointer"
          >
            <MTGCard
              card={{
                name: card.name,
                images: print.images,
                foil: print.foil,
                etched: print.etched,
              }}
            />
          </div>
        ))}
      </SimpleGrid>
    </Modal>
  );
}

export default CardSelector; 