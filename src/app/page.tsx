import DeckEntry from "../components/DeckEntry";

export default function Home() {
  return (
    <div className="grid place-content-center h-screen">
      <h1 className="font-bold text-xl mb-4">Welcome to Fateseal</h1>
      <DeckEntry />
    </div>
  );
}
