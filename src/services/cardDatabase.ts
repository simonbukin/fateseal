import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { FatesealCard } from "@/types/cards";

export type CardData = { [card: string]: FatesealCard };

interface CardDatabaseMeta {
  version: string;
  lastChecked: number;
  cardCount: number;
}

interface FatesealDB extends DBSchema {
  cards: {
    key: string;
    value: CardData;
  };
  meta: {
    key: string;
    value: CardDatabaseMeta;
  };
}

const DB_NAME = "fateseal-cards";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FatesealDB> | null = null;

async function getDB(): Promise<IDBPDatabase<FatesealDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FatesealDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("cards")) {
        db.createObjectStore("cards");
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta");
      }
    },
  });

  return dbInstance;
}

export async function getCardData(): Promise<CardData | null> {
  try {
    const db = await getDB();
    const data = await db.get("cards", "all");
    return data ?? null;
  } catch (error) {
    console.error("Failed to get card data from IndexedDB:", error);
    return null;
  }
}

export async function storeCardData(
  data: CardData,
  version: string
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(["cards", "meta"], "readwrite");

    await Promise.all([
      tx.objectStore("cards").put(data, "all"),
      tx.objectStore("meta").put(
        {
          version,
          lastChecked: Date.now(),
          cardCount: Object.keys(data).length,
        },
        "version"
      ),
      tx.done,
    ]);
  } catch (error) {
    console.error("Failed to store card data in IndexedDB:", error);
    throw error;
  }
}

export async function getStoredVersion(): Promise<string | null> {
  try {
    const db = await getDB();
    const meta = await db.get("meta", "version");
    return meta?.version ?? null;
  } catch (error) {
    console.error("Failed to get stored version from IndexedDB:", error);
    return null;
  }
}

export async function clearDatabase(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(["cards", "meta"], "readwrite");
    await Promise.all([
      tx.objectStore("cards").clear(),
      tx.objectStore("meta").clear(),
      tx.done,
    ]);
  } catch (error) {
    console.error("Failed to clear IndexedDB:", error);
    throw error;
  }
}

export async function fetchVersion(): Promise<string> {
  const response = await fetch("/last-updated.json");
  const data = await response.json();
  return data.lastUpdated;
}

export async function fetchCardDataWithProgress(
  onProgress?: (progress: number) => void
): Promise<CardData> {
  const response = await fetch("/cards.json");

  if (!response.body) {
    // Fallback for browsers that don't support ReadableStream
    const data = await response.json();
    return data;
  }

  const contentLength = response.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!total) {
    // If no Content-Length header, just parse directly
    const data = await response.json();
    return data;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    if (onProgress) {
      onProgress((receivedLength / total) * 100);
    }
  }

  // Combine chunks into single Uint8Array
  const allChunks = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  const text = new TextDecoder().decode(allChunks);
  return JSON.parse(text);
}
