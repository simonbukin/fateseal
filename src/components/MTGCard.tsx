import { ScryfallCard } from "@/utils/deck";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@mantine/core";

interface IMTGCardProps {
  card: ScryfallCard;
}

function MTGCard({ card }: IMTGCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <Image
        className="rounded-sm"
        src={card.imageUrl}
        alt={`The Magic card ${card.name}`}
        onLoad={() => {
          setLoaded(true);
        }}
        width={667}
        height={930}
      />
      {!loaded && <Skeleton width={667} height={930} />}
    </div>
  );
}

export default MTGCard;
