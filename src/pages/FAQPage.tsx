import { Title, Text, Container } from "@mantine/core";
import { Link } from "wouter";

export default function FAQPage() {
  return (
    <Container size="sm" className="py-16">
      <Link
        href="/"
        className="text-purple-600 hover:text-purple-800 transition-colors mb-8 block"
      >
        &larr; Back to deck builder
      </Link>

      <Title order={1} className="mb-12 text-slate-700">
        Frequently Asked Questions
      </Title>

      <div className="mt-4 space-y-12">
        <section>
          <Title order={2} className="mb-4 text-slate-600">
            What is Fateseal?
          </Title>
          <Text className="text-slate-700">
            Fateseal is a specialized tool designed for Magic: The Gathering
            players who want to test their decks on Tabletop Simulator. It
            converts standard deck lists into a format that Tabletop Simulator
            can understand, making it easy to playtest Commander/EDH decks
            online with friends.
          </Text>
        </section>

        <section>
          <Title order={2} className="mb-4 text-slate-600">
            How does it work?
          </Title>
          <Text className="text-slate-700">
            Simply paste your decklist in MTGO format (with optional set names
            and collector numbers), and Fateseal will generate a JSON file that
            you can import directly into Tabletop Simulator. The tool
            automatically handles double-faced cards, tokens, and other special
            card types, ensuring your deck appears exactly as intended in-game.
          </Text>
        </section>

        <section>
          <Title order={2} className="mb-4 text-slate-600">
            Who is this tool for?
          </Title>
          <Text className="text-slate-700">Fateseal is perfect for:</Text>
          <ul className="list-disc ml-6 mt-2 text-slate-700">
            <li>Commander/EDH players who want to test decks before buying</li>
            <li>Playgroups who want to play Magic remotely</li>
            <li>
              Deck builders who want to quickly prototype and test new ideas
            </li>
            <li>
              Players who want to try out expensive cards or combinations before
              investing
            </li>
          </ul>
        </section>

        <section>
          <Title order={2} className="mb-4 text-slate-600">
            What features does Fateseal offer?
          </Title>
          <ul className="list-disc ml-6 text-slate-700">
            <li>Support for all Commander-legal cards</li>
            <li>Automatic token handling</li>
            <li>Double-faced card support</li>
            <li>Custom card back support</li>
            <li>Custom commander image support</li>
            <li>Fuzzy card name matching for typos</li>
            <li>Set-specific card art selection</li>
          </ul>
        </section>

        <section>
          <Title order={2} className="mb-4 text-slate-600">
            What deck format should I use?
          </Title>
          <Text className="text-slate-700">
            Fateseal accepts decklists in MTGO format. Each line should follow
            this pattern:
          </Text>
          <code className="block bg-slate-100 p-4 mt-2 rounded-md font-mono text-sm">
            1 Card Name
            <br />
            1 Card Name (SET) 123
            <br />1 Card Name (SET) 123 *F*
          </code>
          <Text className="mt-2 text-slate-700">
            Where SET is the three-letter set code and 123 is the collector
            number. The *F* suffix indicates foil cards (optional).
          </Text>
        </section>

        <section id="where-do-i-put-my-deck" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Where do I put my deck?</h2>
          <div className="space-y-4">
            <p>
              After converting your deck, you&apos;ll get a JSON file. Save it
              to your Tabletop Simulator saves folder:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Windows:</strong> Documents\My Games\Tabletop
                Simulator\Saves\Saved Objects
              </li>
              <li>
                <strong>macOS:</strong> ~/Library/Tabletop Simulator/Saves/Saved
                Objects
              </li>
              <li>
                <strong>Linux:</strong> ~/.local/share/Tabletop
                Simulator/Saves/Saved Objects
              </li>
            </ul>
            <p>To load the deck in-game:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Host or join a game</li>
              <li>In the top bar, click Objects &rarr; Saved Objects</li>
              <li>Select your deck file</li>
              <li>
                If you have tokens / extra cards, they will appear in a separate
                pile
              </li>
            </ol>
          </div>
        </section>
      </div>
    </Container>
  );
}
