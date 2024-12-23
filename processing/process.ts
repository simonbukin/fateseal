import { Print, AssociatedCard, FatesealCard } from "../src/types/cards";
import { ScryfallCard } from "@scryfall/api-types";
import { ScryfallLayout } from "@scryfall/api-types/src/objects/Card/values/Layout";

function processCard(rawCard: ScryfallCard.Any): Print {
  if (!rawCard?.id || !rawCard?.set || !rawCard?.collector_number) {
    throw new Error(
      `Missing required card properties: ${JSON.stringify(rawCard)}`
    );
  }

  const { id, set, collector_number, all_parts } = rawCard;
  let images: { front?: string; back?: string } = {};
  if ("image_uris" in rawCard && rawCard.image_uris) {
    images.front = rawCard.image_uris.large;
  } else if (
    rawCard.layout === ScryfallLayout.ModalDfc ||
    rawCard.layout === ScryfallLayout.Transform ||
    rawCard.layout === ScryfallLayout.DoubleFacedToken
  ) {
    images.front = rawCard.card_faces[0]?.image_uris?.large;
    images.back = rawCard.card_faces[1]?.image_uris?.large;
  }

  const finishes = rawCard.finishes || [];
  const foil = finishes.includes("foil");
  const etched = finishes.includes("etched");

  let associatedCards: AssociatedCard[] = [];
  if (Array.isArray(all_parts)) {
    associatedCards = all_parts
      .filter(
        (part: AssociatedCard): part is AssociatedCard =>
          part && typeof part === "object" && part.component !== "combo_piece"
      )
      .map(({ id, name, component, uri }) => ({
        id,
        name,
        component,
        uri,
      }));
  }

  const print = {
    id,
    set,
    collectorNumber: collector_number,
    images,
    foil,
    etched,
    associatedCards,
  };
  return print;
}

const file = Bun.file(import.meta.dir + "/cards.json");

const cards: ScryfallCard.Any[] = await file.json();

console.log(`Processing ${cards.length} cards...`);

const englishCards = cards
  .filter((card) => card.lang === "en")
  .filter(
    (card) =>
      card.legalities.commander === "legal" ||
      card.layout === "token" ||
      card.layout === "flip" ||
      card.layout === "double_faced_token" ||
      new Date(card.released_at) > new Date()
  );

console.log(`Processing ${englishCards.length} English cards...`);

const db: { [key: string]: FatesealCard } = {};

englishCards.sort((a, b) => a.name.localeCompare(b.name));

try {
  const batchSize = 100;
  for (let i = 0; i < englishCards.length; i += batchSize) {
    const batch = englishCards.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
        englishCards.length / batchSize
      )}...`
    );
    for (const card of batch) {
      try {
        const name = card.name;
        if (!db[name]) {
          db[name] = {
            name,
            prints: [],
          };
        }

        const print = processCard(card);
        db[name].prints.push(print);
      } catch (cardError) {
        console.error(
          `Error processing card: ${card?.name || "unknown"}`,
          cardError
        );
        continue;
      }
    }

    if (global.gc) {
      console.log("Running garbage collection...");
      global.gc();
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
} catch (error) {
  console.error("Processing failed:", error);
  process.exit(1);
}

for (const [_, card] of Object.entries(db)) {
  try {
    for (const print of card.prints) {
      if (print.associatedCards?.length) {
        for (const associatedCard of print.associatedCards) {
          try {
            const card = db[associatedCard.name];
            if (card) {
              const printById = card.prints.find(
                (print) => print.id === associatedCard.id
              );
              if (printById) {
                associatedCard.images = printById.images;
              }
            }
          } catch (associatedError) {
            console.error(
              `Error processing associated card: ${
                associatedCard?.name || "unknown"
              }`,
              associatedError
            );
            continue;
          }
        }
      }
    }
  } catch (cardError) {
    console.error(
      `Error processing card relationships: ${card?.name || "unknown"}`,
      cardError
    );
    continue;
  }
}

try {
  const outputPath = import.meta.dir + "/processed.json";
  console.log(`Writing processed data to: ${outputPath}`);
  await Bun.write(outputPath, JSON.stringify(db, null, 2));
  console.log(
    `Successfully wrote processed data (${Object.keys(db).length} cards)`
  );
} catch (error) {
  console.error("Failed to write processed data:", error);
  process.exit(1);
}
