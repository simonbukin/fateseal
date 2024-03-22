import { BasicCard } from "@/types/cards";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { Skeleton } from "@mantine/core";

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
      className="relative"
    >
      <Skeleton
        className="max-w-full h-auto border top-0 left-0 absolute"
        height="100%"
        width="100%"
        visible={!loaded}
      >
        <Image
          onLoad={() => setLoaded(true)}
          className="rounded-lg"
          src={card.imageUrl}
          alt={`The Magic card ${card.name}`}
          width={667}
          height={930}
        />
      </Skeleton>
    </motion.div>
  );
}

export default MTGCard;
