import { BasicCard } from "@/types/cards";
import { Image } from "@unpic/react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useRef } from "react";

interface IMTGCardProps {
  card: BasicCard;
}

const CARD_WIDTH = 667;
const CARD_HEIGHT = 930;

/**
 * Holographic card effect inspired by simeydotme/pokemon-cards-css
 * https://github.com/simeydotme/pokemon-cards-css
 */
function MTGCard({ card }: IMTGCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const canFlip = Boolean(card.images.back);
  const isFoil = card.foil || card.etched;
  const isEtched = card.etched;

  // Raw mouse position
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smoothed values for rotation
  const springConfig = { damping: 25, stiffness: 300 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D rotation based on mouse position
  const rotateX = useTransform(smoothY, [0, 1], [12, -12]);
  const rotateY = useTransform(smoothX, [0, 1], [-12, 12]);

  // Gradient position for holographic effect
  const gradientX = useTransform(smoothX, [0, 1], [0, 100]);
  const gradientY = useTransform(smoothY, [0, 1], [0, 100]);

  // Hover state for effect intensity
  const hoverProgress = useMotionValue(0);
  const smoothHover = useSpring(hoverProgress, { damping: 20, stiffness: 200 });

  // Map hover to various effect intensities
  const holoOpacity = useTransform(smoothHover, [0, 1], [0.15, 0.6]);
  const glareOpacity = useTransform(smoothHover, [0, 1], [0, 0.4]);
  const sparkleOpacity = useTransform(smoothHover, [0, 1], [0.1, 0.35]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFoil || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    hoverProgress.set(1);
  };

  const handleMouseLeave = () => {
    if (!isFoil) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
    hoverProgress.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative flex flex-col items-center justify-center"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={isFoil ? { scale: 1.03, transition: { duration: 0.2 } } : {}}
    >
      <motion.div
        className="relative rounded-lg"
        style={{
          rotateX: isFoil ? rotateX : 0,
          rotateY: isFoil ? rotateY : 0,
          transformStyle: "preserve-3d",
          border: !loaded ? "1px solid gainsboro" : "",
          overflow: "hidden",
        }}
      >
        {isFoil && (
          <>
            {/* Layer 1: Base holographic rainbow gradient */}
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none rounded-lg"
              style={{
                background: isEtched
                  ? `linear-gradient(
                      115deg,
                      transparent 20%,
                      rgba(180, 180, 220, 0.4) 36%,
                      rgba(200, 200, 255, 0.5) 42%,
                      rgba(180, 200, 220, 0.4) 48%,
                      transparent 60%
                    )`
                  : `linear-gradient(
                      115deg,
                      transparent 20%,
                      rgba(255, 50, 100, 0.4) 36%,
                      rgba(255, 200, 50, 0.35) 42%,
                      rgba(50, 255, 150, 0.35) 48%,
                      rgba(50, 150, 255, 0.4) 54%,
                      rgba(180, 50, 255, 0.35) 60%,
                      transparent 80%
                    )`,
                backgroundSize: "150% 150%",
                backgroundPosition: `${gradientX.get()}% ${gradientY.get()}%`,
                mixBlendMode: "color-dodge",
                opacity: holoOpacity,
                filter: "brightness(1.1) contrast(1.1)",
              }}
            />

            {/* Layer 2: Iridescent shimmer overlay */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none rounded-lg"
              style={{
                background: `
                  repeating-linear-gradient(
                    ${45 + gradientX.get() * 0.3}deg,
                    transparent 0px,
                    rgba(255, 255, 255, 0.03) 1px,
                    transparent 2px,
                    transparent 4px
                  )
                `,
                mixBlendMode: "overlay",
                opacity: sparkleOpacity,
              }}
            />

            {/* Layer 3: Dynamic glare/shine spot */}
            <motion.div
              className="absolute inset-0 z-30 pointer-events-none rounded-lg"
              style={{
                background: `radial-gradient(
                  ellipse 80% 50% at ${gradientX.get()}% ${gradientY.get()}%,
                  rgba(255, 255, 255, 0.5) 0%,
                  rgba(255, 255, 255, 0.2) 20%,
                  transparent 50%
                )`,
                mixBlendMode: "soft-light",
                opacity: glareOpacity,
              }}
            />

            {/* Layer 4: Subtle color shift based on angle */}
            <motion.div
              className="absolute inset-0 z-15 pointer-events-none rounded-lg"
              style={{
                background: isEtched
                  ? `linear-gradient(
                      ${130 + (gradientX.get() - 50) * 0.5}deg,
                      rgba(200, 200, 230, 0.15) 0%,
                      transparent 50%,
                      rgba(180, 180, 210, 0.15) 100%
                    )`
                  : `linear-gradient(
                      ${130 + (gradientX.get() - 50) * 0.5}deg,
                      rgba(255, 100, 200, 0.15) 0%,
                      transparent 50%,
                      rgba(100, 200, 255, 0.15) 100%
                    )`,
                mixBlendMode: "hue",
                opacity: holoOpacity,
              }}
            />
          </>
        )}
        <Image
          onLoad={() => setLoaded(true)}
          onMouseOver={() => {
            if (canFlip) setFlipped(true);
          }}
          onMouseOut={() => {
            if (canFlip) setFlipped(false);
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
