import { BasicCard } from "@/types/cards";
import Image from "next/image";

interface IMTGCardProps {
  card: BasicCard;
}

function MTGCard({ card }: IMTGCardProps) {
  return (
    <div>
      <Image
        className="rounded-lg"
        src={card.imageUrl}
        alt={`The Magic card ${card.name}`}
        width={667}
        height={930}
      />
    </div>
  );
}

export default MTGCard;
