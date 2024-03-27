import { Print, AssociatedCard } from "../src/types/cards";
import { ScryfallCard } from "@scryfall/api-types";
import { ScryfallLayout } from "@scryfall/api-types/src/objects/Card/values/Layout";

function processCard(rawCard: ScryfallCard.Any): Print {
  const { id, set, collector_number, all_parts } = rawCard;
  let images: { front?: string; back?: string } = {};
  if ("image_uris" in rawCard && rawCard.image_uris) {
    images.front = rawCard.image_uris.large;
  } else if (
    rawCard.layout === ScryfallLayout.ModalDfc ||
    rawCard.layout === ScryfallLayout.Transform
  ) {
    images.front = rawCard.card_faces[0]?.image_uris?.large;
    images.back = rawCard.card_faces[1]?.image_uris?.large;
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
    images,
    associatedCards,
  };
  return print;
}

const file = Bun.file(import.meta.dir + "/cards.json");

const cards: ScryfallCard.Any[] = await file.json();

const englishCards = cards
  .filter((card) => card.lang === "en")
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
