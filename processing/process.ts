import { Print, AssociatedCard, FatesealCard } from "../src/types/cards";
import { ScryfallCard } from "@scryfall/api-types";
import { ScryfallLayout } from "@scryfall/api-types/src/objects/Card/values/Layout";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createReadStream } from "fs";
import { createInterface } from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function processLargeFile() {
  const filePath = path.join(__dirname, "cards.json");
  const fileStream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const db: { [key: string]: FatesealCard } = {};
  let isFirstLine = true;
  let cardCount = 0;

  for await (const line of rl) {
    if (isFirstLine) {
      // Skip the opening bracket
      isFirstLine = false;
      continue;
    }

    // Remove trailing comma if present
    const cleanLine = line.trim().replace(/,$/, "");

    // Skip empty lines and the closing bracket
    if (cleanLine === "" || cleanLine === "]") continue;

    try {
      const card: ScryfallCard.Any = JSON.parse(cleanLine);

      if (
        card.lang === "en" &&
        (card.legalities.commander === "legal" ||
          card.layout === "token" ||
          card.layout === "flip" ||
          card.layout === "double_faced_token" ||
          new Date(card.released_at) > new Date())
      ) {
        const name = card.name;
        if (!db[name]) {
          db[name] = {
            name,
            prints: [],
          };
        }

        const print = processCard(card);
        db[name].prints.push(print);
        cardCount++;

        if (cardCount % 1000 === 0) {
          console.log(`Processed ${cardCount} cards...`);
        }
      }
    } catch (error) {
      console.error("Error processing line:", error);
      continue;
    }

    // Optional: Periodic garbage collection every 5000 cards
    if (cardCount % 5000 === 0 && global.gc) {
      console.log("Running garbage collection...");
      global.gc();
    }
  }

  console.log(`Finished initial processing. Total cards: ${cardCount}`);
  console.log("Processing associated cards...");

  // Process associated cards
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
    const outputPath = path.join(__dirname, "processed.json");
    console.log(`Writing processed data to: ${outputPath}`);
    await fs.writeFile(outputPath, JSON.stringify(db, null, 2), "utf-8");
    console.log(
      `Successfully wrote processed data (${Object.keys(db).length} cards)`
    );
  } catch (error) {
    console.error("Failed to write processed data:", error);
    process.exit(1);
  }
}

// Call the async function
await processLargeFile();
