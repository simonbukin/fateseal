import { Epilogue } from "next/font/google";
import DeckEntry from "../components/DeckEntry";
import Image from "next/image";
import InfoHoverCard from "@/components/InfoHoverCard";

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
              <InfoHoverCard />
            </h1>
          </div>
          <Image
            src="/logo.svg"
            alt="Fateseal logo"
            width={96}
            height={96}
            className="mr-10 transition-all hover:rotate-12"
          />
        </div>
        <DeckEntry />
      </div>
    </div>
  );
}
