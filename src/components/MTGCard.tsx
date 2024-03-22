import { BasicCard } from "@/types/cards";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

interface IMTGCardProps {
  card: BasicCard;
}

function MTGCard({ card }: IMTGCardProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.125 }}
    >
      <Image
        key={String(loaded)}
        onLoad={() => setLoaded(true)}
        className="rounded-lg"
        src={card.imageUrl}
        alt={`The Magic card ${card.name}`}
        width={667}
        height={930}
      />
    </motion.div>
  );
}

export default MTGCard;
