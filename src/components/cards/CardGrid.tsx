import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useDeck } from "@/store/deckContext";
import MTGCard from "@/components/MTGCard";
import type { BasicCard } from "@/types/cards";

interface CardGridProps {
  onCardClick: (card: BasicCard, index: number) => void;
}

const smoothEase = [0.25, 0.1, 0.25, 1] as const;

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.02, 0.5),
      duration: 0.3,
      ease: smoothEase,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -10,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

export function CardGrid({ onCardClick }: CardGridProps) {
  const { state } = useDeck();
  const { cards, extras } = state;

  if (cards.length === 0 && extras.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 mt-8"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={sectionVariants}
    >
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {cards.length > 0 && (
            <motion.div
              key="main-deck"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sectionVariants}
            >
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Main Deck ({cards.length})
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Click any card to change its art
                </p>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-8">
                <AnimatePresence mode="popLayout">
                  {cards.map((card, i) => (
                    <motion.li
                      key={card.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <motion.div
                        className={
                          card.name !== "Custom Commander"
                            ? "cursor-pointer"
                            : ""
                        }
                        onClick={() => {
                          if (card.name !== "Custom Commander") {
                            onCardClick(card, i);
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15, ease: smoothEase }}
                      >
                        <MTGCard card={card} />
                      </motion.div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}

          {extras.length > 0 && (
            <motion.div
              key="extras"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sectionVariants}
            >
              <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                Tokens & Extras ({extras.length})
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-8">
                <AnimatePresence mode="popLayout">
                  {extras.map((card, i) => (
                    <motion.li
                      key={card.id}
                      custom={i + cards.length}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <MTGCard card={card} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
