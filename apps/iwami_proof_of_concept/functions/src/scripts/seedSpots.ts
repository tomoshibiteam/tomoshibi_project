import { readFile } from "node:fs/promises";
import path from "node:path";
import { getFirebaseAdminDb } from "../firebase-admin";
import { normalizeSpotData, validateSpotInput } from "../spots/spotModel";
import { saveSpot } from "../spots/spotRepository";

function resolveSeedPath(): string {
  if (process.env.SPOTS_JSON_PATH) {
    return path.resolve(process.cwd(), process.env.SPOTS_JSON_PATH);
  }
  return path.resolve(process.cwd(), "src/seeds/spots.seed.json");
}

function resolveMode(): "create" | "update" | "upsert" {
  const mode = process.env.SEED_MODE;
  if (mode === "create" || mode === "update" || mode === "upsert") {
    return mode;
  }
  return "upsert";
}

async function loadRawSpots(seedPath: string): Promise<unknown[]> {
  const rawJson = await readFile(seedPath, "utf-8");
  const parsed = JSON.parse(rawJson);

  if (!Array.isArray(parsed)) {
    throw new Error("spots seed json must be an array");
  }

  return parsed;
}

async function main() {
  const seedPath = resolveSeedPath();
  const mode = resolveMode();
  const rawSpots = await loadRawSpots(seedPath);
  const db = getFirebaseAdminDb();

  let successCount = 0;
  for (const [index, rawSpot] of rawSpots.entries()) {
    const validated = validateSpotInput(rawSpot);
    const normalized = normalizeSpotData(validated);

    await saveSpot({
      db,
      spot: normalized,
      mode,
    });

    successCount += 1;
    console.log(`[seedSpots] upserted ${normalized.id} (${index + 1}/${rawSpots.length})`);
  }

  console.log(`[seedSpots] completed. success=${successCount} mode=${mode} file=${seedPath}`);
}

main().catch((error) => {
  console.error("[seedSpots] failed", error);
  process.exitCode = 1;
});
