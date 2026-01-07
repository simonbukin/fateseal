import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};
vi.stubGlobal("indexedDB", indexedDB);

// Mock fetch for card data tests
vi.stubGlobal("fetch", vi.fn());
