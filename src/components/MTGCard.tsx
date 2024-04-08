import { BasicCard } from "@/types/cards";
import { Image } from "@unpic/react";
import { motion } from "framer-motion";
import { useState } from "react";

interface IMTGCardProps {
  card: BasicCard;
}

function MTGCard({ card }: IMTGCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const canFlip = Boolean(card.images.back);

  return (
    <motion.div
      key={Number(loaded)}
      initial={{
        y: Math.floor(Math.random() * 50) * (Math.random() > 0.5 ? -1 : 1),
        x: Math.floor(Math.random() * 50) * (Math.random() > 0.5 ? -1 : 1),
        opacity: 0,
        rotateX: 90,
        rotateY: 90,
        rotateZ: 90,
      }}
      whileInView={{ opacity: 1 }}
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.1 },
      }}
      animate={{
        y: 0,
        x: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        opacity: 0.8,
      }}
      transition={{ duration: 0.75, ease: "anticipate" }}
      className="relative flex flex-col items-center justify-center"
      style={{
        border: !loaded ? "1px solid gainsboro" : "",
      }}
    >
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
        className="rounded-lg transition-all"
        src={(flipped ? card.images.back : card.images.front) || ""}
        alt={`The Magic card ${card.name}`}
        width={667}
        height={930}
      />
    </motion.div>
  );
}

export default MTGCard;
