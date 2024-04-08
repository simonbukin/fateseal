"use client";

import { Image } from "@unpic/react";
import { useState } from "react";

enum MANA {
  PLAINS,
  ISLAND,
  SWAMP,
  MOUNTAIN,
  FOREST,
  WASTES,
}

const pickRandom = <T,>(collection: T[]): T => {
  return collection[Math.floor(Math.random() * collection.length)];
};

function FatesealLogo() {
  const [hovering, setHovering] = useState(false);
  const [currentMana, setCurrentMana] = useState<string>("swamp");

  const onHover = () => {
    setHovering(true);
    const mana = pickRandom(
      Object.values(MANA).filter((val) => typeof val !== "number"),
    );
    const manaString = mana.toString().toLocaleLowerCase();
    setCurrentMana(manaString);
  };

  return (
    <div className="relative">
      <Image
        onMouseEnter={onHover}
        onMouseLeave={() => setHovering(false)}
        src="/logo.svg"
        alt="Fateseal logo"
        width={96}
        height={96}
        className="mr-10 transition-all hover:rotate-12"
      />
      <Image
        hidden={!hovering}
        src={`/${currentMana}.svg`}
        alt={`A MTG ${currentMana} icon`}
        width={32}
        height={32}
        priority
        className="pointer-events-none absolute left-8 top-8 hover:rotate-[50deg]"
      />
    </div>
  );
}

export default FatesealLogo;
