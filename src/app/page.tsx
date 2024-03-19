import DeckEntry from "../components/DeckEntry";

export default function Home() {
  return (
    <div className="grid h-screen place-content-center">
      <div className="min-w-[25rem]">
        <h1 className="mb-4 text-xl font-bold">Welcome to Fateseal</h1>
        <DeckEntry />
      </div>
    </div>
  );
}
