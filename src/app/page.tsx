import { Epilogue } from "next/font/google";
import DeckEntry from "../components/DeckEntry";
import InfoHoverCard from "@/components/InfoHoverCard";
import FatesealLogo from "@/components/FatesealLogo";

const epilogue = Epilogue({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="grid place-content-center">
      <div className="mt-10 flex max-w-100 flex-col items-center justify-center">
        <div className="flex w-full flex-row justify-between gap-4">
          <div>
            <h1
              className={`${epilogue.className} relative my-8 text-5xl font-bold`}
            >
              fateseal
              <div className="relative -top-4">
                <InfoHoverCard />
              </div>
            </h1>
          </div>
          <FatesealLogo />
        </div>
        <DeckEntry />
      </div>
    </div>
  );
}
