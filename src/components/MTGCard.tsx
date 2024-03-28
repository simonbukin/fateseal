import { BasicCard } from "@/types/cards";
import Image from "next/image";
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
      }}
      animate={{ y: 0, x: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col items-center justify-center"
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
        style={{
          border: !loaded ? "1px solid gainsboro" : "",
        }}
        src={(flipped ? card.images.back : card.images.front) || ""}
        alt={`The Magic card ${card.name}`}
        width={667}
        height={930}
      />
    </motion.div>
  );
}

export default MTGCard;
