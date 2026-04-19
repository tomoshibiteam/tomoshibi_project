import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SpotRecord = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  source: string;
  address: string;
  kinds: string;
};

type RawSpotDbPayload = {
  generated_at?: unknown;
  spots?: unknown;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const normalizeSpotRecord = (value: unknown, index: number): SpotRecord | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  const idRaw = toStringValue(record.id).trim();
  const name = toStringValue(record.name).trim();
  const lat = record.lat;
  const lng = record.lng;

  if (!name || !isFiniteNumber(lat) || !isFiniteNumber(lng)) return null;

  return {
    id: idRaw || `spot-${index + 1}`,
    name,
    lat,
    lng,
    source: toStringValue(record.source).trim() || "unknown",
    address: toStringValue(record.address).trim(),
    kinds: toStringValue(record.kinds).trim(),
  };
};

const DEFAULT_SPOT_DB_CANDIDATES = [
  path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "..",
    "tomoshibi-mobile",
    "mastra",
    "src",
    "data",
    "ito_spots.seed.json",
  ),
  path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "apps",
    "tomoshibi-mobile",
    "mastra",
    "src",
    "data",
    "ito_spots.seed.json",
  ),
];

const resolveSpotDbPath = async () => {
  const envSpotDbPath = [process.env.ADMIN_SPOT_DB_PATH, process.env.MASTRA_ITO_SPOT_DB_PATH]
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .find((item) => item.length > 0);

  const candidates = [
    ...(envSpotDbPath ? [envSpotDbPath] : []),
    ...DEFAULT_SPOT_DB_CANDIDATES,
  ];

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }
  return null;
};

export async function GET() {
  const spotDbPath = await resolveSpotDbPath();
  if (!spotDbPath) {
    return NextResponse.json(
      { error: "スポットDBファイルが見つかりません。" },
      { status: 404 },
    );
  }

  try {
    const rawFile = await fs.readFile(spotDbPath, "utf8");
    const payload = JSON.parse(rawFile) as RawSpotDbPayload;
    const rawSpots = Array.isArray(payload.spots) ? payload.spots : [];
    const spots = rawSpots
      .map((record, index) => normalizeSpotRecord(record, index))
      .filter((record): record is SpotRecord => Boolean(record));

    return NextResponse.json({
      generatedAt: typeof payload.generated_at === "string" ? payload.generated_at : null,
      totalSpots: spots.length,
      spots,
    });
  } catch {
    return NextResponse.json(
      { error: "スポットDBの読み込み中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
