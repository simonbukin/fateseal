import { Print, AssociatedCard } from "../src/types/cards";
import { ScryfallCard } from "@scryfall/api-types";

function processCard(rawCard: ScryfallCard.Any): Print {
  const { id, set, collector_number, all_parts } = rawCard;
  let largeImage: string | undefined = "";
  if ("image_uris" in rawCard) {
    largeImage = rawCard.image_uris && rawCard.image_uris.large;
  }
  let associatedCards: AssociatedCard[] = [];
  if (all_parts) {
    const associatedCardsFiltered = all_parts.filter(
      (part: AssociatedCard) => part.component !== "combo_piece"
    );
    associatedCards = associatedCardsFiltered.map((part: AssociatedCard) => {
      const { id, name, component, uri } = part;
      return {
        id,
        name,
        component,
        uri,
      };
    });
  }

  const print = {
    id,
    set,
    collectorNumber: collector_number,
    imageUrl: largeImage || "",
    associatedCards,
  };
  return print;
}

const file = Bun.file(import.meta.dir + "/cards.json");

const cards: ScryfallCard.Any[] = await file.json();

const englishCards = cards
  .filter((card) => card.lang === "en")
  .filter((card) => {
    return "image_uris" in card && card.image_uris && card.image_uris.large;
  })
  .filter(
    (card) => card.legalities.commander === "legal" || card.layout === "token"
  );

const db = {};

englishCards.sort((a, b) => a.name.localeCompare(b.name));

for (let i = 0; i < englishCards.length; i++) {
  const card = englishCards[i];
  const name = card.name;

  if (!db[name]) {
    db[name] = {
      name,
      prints: [],
    };
  }

  const print = processCard(card);
  db[name].prints.push(print);
}

await Bun.write(
  import.meta.dir + "/processed.json",
  JSON.stringify(db, null, 2)
);
