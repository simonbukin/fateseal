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
      transition={{ duration: 0.25 }}
      className="relative flex flex-col items-center justify-center"
    >
      <Image
        onLoad={() => setLoaded(true)}
        className="rounded-lg"
        style={{
          border: !loaded ? "1px solid gainsboro" : "",
        }}
        src={card.imageUrl}
        alt={`The Magic card ${card.name}`}
        width={667}
        height={930}
      />
    </motion.div>
  );
}

export default MTGCard;
