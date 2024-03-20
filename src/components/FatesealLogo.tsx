"use client";

import Image from "next/image";
import { useState } from "react";

enum MANA {
  PLAINS,
  ISLAND,
  SWAMP,
  MOUNTAIN,
  FOREST,
  WASTES,
}

const manaToColor = {
  plains: "rgb(249, 250, 244)",
  island: "rgb(14, 104, 171)",
  swamp: "rgb(21, 11, 0)",
  mountain: "rgb(211, 32, 42)",
  forest: "rgb(0, 115, 62)",
};

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
        className="pointer-events-none absolute left-8 top-8 hover:rotate-[50deg]"
      />
    </div>
  );
}

export default FatesealLogo;
