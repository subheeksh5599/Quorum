import type { DataProvider } from "./provider";
import { memoryProvider } from "./memory";
import { cleanverseProvider } from "./cleanverse";
import { isConfigured } from "../cleanverse/client";
import { seedPrecedents } from "../seed";

let _provider: DataProvider | null = null;
let _seeded = false;

export function getProvider(): DataProvider {
  if (_provider) return _provider;

  const useCleanverse =
    process.env.DATA_PROVIDER === "cleanverse" && isConfigured();

  _provider = useCleanverse ? cleanverseProvider : memoryProvider;

  if (useCleanverse) {
    console.log("[Quorum] Using Cleanverse data provider");
    if (!_seeded && seedPrecedents.length > 0) {
      _provider.loadPrecedents(seedPrecedents);
      _seeded = true;
      console.log(`[Quorum] Seeded ${seedPrecedents.length} precedent cases`);
    }
  } else {
    console.log("[Quorum] Using in-memory data provider");
    if (!_seeded && seedPrecedents.length > 0) {
      _provider.loadPrecedents(seedPrecedents);
      _seeded = true;
      console.log(`[Quorum] Seeded ${seedPrecedents.length} precedent cases`);
    }
  }

  return _provider;
}

export function resetProvider(): void {
  _provider = null;
  _seeded = false;
}

export { type DataProvider };
