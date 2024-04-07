import { Print, AssociatedCard, FatesealCard } from "../src/types/cards";
import { ScryfallCard } from "@scryfall/api-types";
import { ScryfallLayout } from "@scryfall/api-types/src/objects/Card/values/Layout";

function processCard(rawCard: ScryfallCard.Any): Print {
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

  const foil = Boolean(rawCard.finishes.find((finish) => finish === "foil"));
  const etched = Boolean(
    rawCard.finishes.find((finish) => finish === "etched")
  );

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
    foil,
    etched,
    associatedCards,
  };
  return print;
}

const file = Bun.file(import.meta.dir + "/cards.json");

const cards: ScryfallCard.Any[] = await file.json();

const englishCards = cards
  .filter((card) => card.lang === "en")
  .filter(
    (card) =>
      card.legalities.commander === "legal" ||
      card.layout === "token" ||
      card.layout === "double_faced_token" ||
      new Date(card.released_at) > new Date()
  );

const db: { [key: string]: FatesealCard } = {};

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

for (const [_, card] of Object.entries(db)) {
  for (const print of card.prints) {
    if (print.associatedCards) {
      for (let i = 0; i < print.associatedCards.length; i++) {
        const associatedCard = print.associatedCards[i];
        const card = db[associatedCard.name];
        if (card) {
          const printById = card.prints.find(
            (print) => print.id === associatedCard.id
          );
          if (printById) {
            associatedCard.images = printById.images;
          }
        }
      }
    }
  }
}

await Bun.write(
  import.meta.dir + "/processed.json",
  JSON.stringify(db, null, 2)
);
