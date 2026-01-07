import { BasicCard } from "@/types/cards";
import { Image } from "@unpic/react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

interface IMTGCardProps {
  card: BasicCard;
}

const CARD_WIDTH = 667;
const CARD_HEIGHT = 930;

function MTGCard({ card }: IMTGCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const canFlip = Boolean(card.images.back);
  const isFoil = card.foil || card.etched;

  const mouseX = useMotionValue(CARD_WIDTH / 2);
  const mouseY = useMotionValue(CARD_HEIGHT / 2);

  const rotateX = useTransform(mouseY, [0, CARD_HEIGHT], [10, -10]);
  const rotateY = useTransform(mouseX, [0, CARD_WIDTH], [-10, 10]);

  const glareX = useTransform(mouseX, [0, CARD_WIDTH], [-20, 120]);
  const glareY = useTransform(mouseY, [0, CARD_HEIGHT], [-20, 120]);

  // A motion value that will be 1 on hover, 0 otherwise.
  const hoverProgress = useMotionValue(0);

  // Map hover progress to different opacities for each layer
  const holoOpacity = useTransform(hoverProgress, [0, 1], [0.2, 0.5]); // Always on, brighter on hover
  const glareOpacity = useTransform(hoverProgress, [0, 1], [0, 0.5]); // Only on hover

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFoil) return;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
    hoverProgress.set(1);
  };

  const handleMouseLeave = () => {
    if (!isFoil) return;
    mouseX.set(CARD_WIDTH / 2);
    mouseY.set(CARD_HEIGHT / 2);
    hoverProgress.set(0);
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      style={{
        perspective: "1200px",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={isFoil ? { scale: 1.05, transition: { duration: 0.1 } } : {}}
    >
      <motion.div
        className="relative rounded-lg"
        style={{
          rotateX,
          rotateY,
          border: !loaded ? "1px solid gainsboro" : "",
          transition: "all 0.2s ease-out",
          overflow: "hidden", // This will clip the foil effect
        }}
      >
        {isFoil && (
          <>
            {/* Holographic rainbow layer - always on, brighter on hover */}
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none rounded-lg"
              style={{
                background:
                  "linear-gradient(110deg, rgba(255, 0, 0, 0.4) 0%, rgba(255, 165, 0, 0.4) 15%, rgba(255, 255, 0, 0.4) 30%, rgba(0, 128, 0, 0.4) 45%, rgba(0, 0, 255, 0.4) 60%, rgba(75, 0, 130, 0.4) 75%, rgba(238, 130, 238, 0.4) 90%)",
                backgroundSize: "200% 200%",
                mixBlendMode: "color-dodge",
                opacity: holoOpacity,
                transition: "opacity 0.2s",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "linear",
              }}
            />
            {/* Specular sheen layer - only on hover */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none rounded-lg"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.6), transparent 25%)`,
                mixBlendMode: "overlay",
                opacity: glareOpacity,
                transition: "opacity 0.2s",
              }}
            />
          </>
        )}
        <Image
          onLoad={() => setLoaded(true)}
          onMouseOver={() => {
            if (canFlip) {
              setFlipped(true);
            }
          }}
          onMouseOut={() => {
            if (canFlip) {
              setFlipped(false);
            }
          }}
          className="rounded-lg block"
          src={(flipped ? card.images.back : card.images.front) || ""}
          alt={`The Magic card ${card.name}`}
          width={667}
          height={930}
        />
      </motion.div>
    </motion.div>
  );
}

export default MTGCard;
