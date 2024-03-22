import { Epilogue } from "next/font/google";
import DeckEntry, { CardData } from "../components/DeckEntry";
import cardDataRaw from "@/data/cards.json";

/* @ts-ignore */
const cardData: CardData = cardDataRaw;

import InfoHoverCard from "@/components/InfoHoverCard";
import FatesealLogo from "@/components/FatesealLogo";

const epilogue = Epilogue({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="grid place-content-center">
      <div className="mt-10 flex min-w-[25rem] flex-col items-center justify-center">
        <div className="flex w-full flex-row justify-between gap-4">
          <div>
            <h1
              className={`${epilogue.className} relative my-8 text-5xl font-bold`}
            >
              fateseal
              <div className="relative -top-5">
                <InfoHoverCard />
              </div>
            </h1>
          </div>
          <FatesealLogo />
        </div>
        <DeckEntry cardData={cardData} />
      </div>
    </div>
  );
}
