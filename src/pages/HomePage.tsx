import { DeckBuilder } from "@/components/deck/DeckBuilder";
import InfoHoverCard from "@/components/InfoHoverCard";
import FatesealLogo from "@/components/FatesealLogo";

export default function HomePage() {
  return (
    <div className="grid place-content-center">
      <div className="mt-10 flex max-w-100 flex-col items-center justify-center">
        <div className="flex w-full flex-row justify-between gap-4">
          <div>
            <h1 className="relative my-8 text-5xl font-bold font-epilogue">
              fateseal
              <div className="relative -top-4">
                <InfoHoverCard />
              </div>
            </h1>
          </div>
          <FatesealLogo />
        </div>
        <DeckBuilder />
      </div>
    </div>
  );
}
