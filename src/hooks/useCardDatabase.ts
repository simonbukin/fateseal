import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import {
  getCardData,
  storeCardData,
  getStoredVersion,
  fetchVersion,
  fetchCardDataWithProgress,
  CardData,
} from "@/services/cardDatabase";

interface UseCardDatabaseState {
  data: CardData | null;
  fuse: Fuse<string> | null;
  loading: boolean;
  progress: number;
  error: Error | null;
  isFirstLoad: boolean;
}

interface UseCardDatabaseReturn extends UseCardDatabaseState {
  refresh: () => Promise<void>;
}

function createFuseIndex(data: CardData): Fuse<string> {
  const cardNames = Object.keys(data);
  return new Fuse(cardNames, {
    threshold: 0.4,
    includeScore: true,
  });
}

export function useCardDatabase(): UseCardDatabaseReturn {
  const [state, setState] = useState<UseCardDatabaseState>({
    data: null,
    fuse: null,
    loading: true,
    progress: 0,
    error: null,
    isFirstLoad: false,
  });

  const initializedRef = useRef(false);
  const checkingUpdatesRef = useRef(false);

  // Check for updates in background (non-blocking)
  const checkForUpdates = useCallback(async (currentVersion: string | null) => {
    if (checkingUpdatesRef.current) return;
    checkingUpdatesRef.current = true;

    try {
      const remoteVersion = await fetchVersion();

      if (remoteVersion !== currentVersion) {
        console.log(
          `Card database update available: ${currentVersion} -> ${remoteVersion}`
        );

        // Download new data in background
        const newData = await fetchCardDataWithProgress();
        await storeCardData(newData, remoteVersion);

        // Update state with new data
        setState((s) => ({
          ...s,
          data: newData,
          fuse: createFuseIndex(newData),
        }));

        console.log("Card database updated successfully");
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    } finally {
      checkingUpdatesRef.current = false;
    }
  }, []);

  // Download for first-time users
  const downloadAndStore = useCallback(async () => {
    setState((s) => ({ ...s, isFirstLoad: true, loading: true, progress: 0 }));

    try {
      const data = await fetchCardDataWithProgress((progress) => {
        setState((s) => ({ ...s, progress }));
      });

      const version = await fetchVersion();
      await storeCardData(data, version);

      const fuse = createFuseIndex(data);

      setState({
        data,
        fuse,
        loading: false,
        isFirstLoad: false,
        progress: 100,
        error: null,
      });
    } catch (error) {
      console.error("Failed to download card data:", error);
      setState((s) => ({
        ...s,
        error: error instanceof Error ? error : new Error("Download failed"),
        loading: false,
        isFirstLoad: false,
      }));
    }
  }, []);

  // Initialize once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initialize() {
      try {
        // Check IndexedDB for existing data
        const cachedData = await getCardData();

        if (cachedData) {
          // Returning user: Show cached data IMMEDIATELY
          const fuse = createFuseIndex(cachedData);
          setState({
            data: cachedData,
            fuse,
            loading: false,
            progress: 100,
            error: null,
            isFirstLoad: false,
          });

          // Check for updates in background (non-blocking)
          const storedVersion = await getStoredVersion();
          checkForUpdates(storedVersion);
        } else {
          // First-time user: Must download
          await downloadAndStore();
        }
      } catch (error) {
        console.error("Failed to initialize card database:", error);
        await downloadAndStore();
      }
    }

    initialize();
  }, [checkForUpdates, downloadAndStore]);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    await downloadAndStore();
  }, [downloadAndStore]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh]
  );
}
