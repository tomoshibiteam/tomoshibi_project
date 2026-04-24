import { readFile as readTextFile } from "node:fs/promises";
import path from "node:path";
import { read, utils } from "xlsx";
import { deriveBusinessOperationalData } from "../spots/businessRules";
import { getSpotById, updateSpot } from "../spots/spotService";
import { getFirebaseAdminDb } from "../firebase-admin";
import type {
  SpotBusinessDay,
  SpotLastAdmissionRule,
  SpotOperationalJudgement,
  SpotSeasonalClosure,
  SpotWeeklyHours,
  SpotWeeklyHoursRange,
} from "../spots/spotTypes";

type CsvRow = {
  slug?: unknown;
  "\ufeffslug"?: unknown;
  name?: unknown;
  lastAdmission?: unknown;
  regularClosedDays?: unknown;
  seasonalClosures?: unknown;
  hasIrregularClosures?: unknown;
  weeklyHours?: unknown;
  confidence?: unknown;
  notes?: unknown;
  primarySources?: unknown;
};

const DEFAULT_CSV_PATH = "/Users/wataru/Downloads/iwami_22_missing_fields_verified.csv";
const UNRESOLVED_KEYWORDS =
  /未確認|未公開|要確認|公開なし|明記なし|要問合せ|不定休|変則|通行止め|随時対応|食い違う|休業あり|混雑時に変更/;
const CSV_PARSER_VERSION = 2;

function resolveCsvPath(): string {
  const rawPath = process.env.SPOTS_MISSING_FIELDS_CSV_PATH?.trim();
  if (rawPath) {
    return path.resolve(process.cwd(), rawPath);
  }
  return DEFAULT_CSV_PATH;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  const text = asString(value)?.toLowerCase();
  if (!text) return null;
  if (text === "true" || text === "yes") return true;
  if (text === "false" || text === "no") return false;
  return null;
}

function toHhmm(raw: string): string | null {
  const normalized = raw.replace(/[：]/g, ":").trim();
  const match = normalized.match(/^([0-2]?\d):([0-5]\d)$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function findTimeRanges(text: string): SpotWeeklyHoursRange[] {
  const ranges: SpotWeeklyHoursRange[] = [];
  const matches = text.matchAll(/([0-2]?\d[:：][0-5]\d)\s*[-〜～]\s*([0-2]?\d[:：][0-5]\d)/g);
  for (const match of matches) {
    const open = toHhmm(match[1] ?? "");
    const close = toHhmm(match[2] ?? "");
    if (!open || !close || open >= close) continue;
    ranges.push({ open, close });
  }
  return ranges;
}

function splitSourceList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[\/／|]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseWeeklyHoursRaw(value: string | null): Partial<
  Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", string>
> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const out: Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", string>> = {};
    for (const day of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const) {
      const text = asString(parsed[day]);
      if (!text) continue;
      out[day] = text;
    }
    return out;
  } catch {
    return {};
  }
}

function parseWeeklyHoursStructured(
  raw: Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", string>>,
): SpotWeeklyHours | undefined {
  const out: SpotWeeklyHours = {};
  for (const day of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const) {
    const text = raw[day];
    if (!text) continue;

    const ranges = findTimeRanges(text);
    const isClosed = /(closed|休|休業|休館)/i.test(text);
    if (ranges.length > 0) {
      out[day] = ranges;
      continue;
    }
    if (isClosed) {
      out[day] = [];
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function parseRegularClosedDays(value: string | null): SpotBusinessDay[] {
  if (!value) return [];
  const original = value;
  const days = new Set<SpotBusinessDay>();
  if (/祝日|祝/.test(value)) {
    days.add("holiday");
  }

  const dayPatterns: Array<{ day: SpotBusinessDay; regex: RegExp }> = [
    { day: "mon", regex: /(月曜|月曜日|\bmon(?:day)?\b)/i },
    { day: "tue", regex: /(火曜|火曜日|\btue(?:sday)?\b)/i },
    { day: "wed", regex: /(水曜|水曜日|\bwed(?:nesday)?\b)/i },
    { day: "thu", regex: /(木曜|木曜日|\bthu(?:rsday)?\b)/i },
    { day: "fri", regex: /(金曜|金曜日|\bfri(?:day)?\b)/i },
    { day: "sat", regex: /(土曜|土曜日|\bsat(?:urday)?\b)/i },
    { day: "sun", regex: /(日曜|日曜日|\bsun(?:day)?\b)/i },
  ];

  const segments = original.split(/[／/]/).map((segment) => segment.trim());
  for (const segment of segments) {
    if (!/(休|closed|定休|休館|休業)/i.test(segment)) continue;
    if (/除く/.test(segment)) continue;

    if (/平日/.test(segment)) {
      days.add("mon");
      days.add("tue");
      days.add("wed");
      days.add("thu");
      days.add("fri");
    }
    if (/土日/.test(segment)) {
      days.add("sat");
      days.add("sun");
    }
    for (const pattern of dayPatterns) {
      if (pattern.regex.test(segment)) {
        days.add(pattern.day);
      }
    }
    const shorthandClosed = segment.matchAll(
      /(?:^|[・\/、,\s])([月火水木金土日](?:[・\/、,\s]+[月火水木金土日])*)休/g,
    );
    for (const match of shorthandClosed) {
      const group = match[1] ?? "";
      for (const token of group.split(/[・\/、,\s]+/)) {
        const char = token.replace(/休/g, "").trim();
        if (char === "月") days.add("mon");
        if (char === "火") days.add("tue");
        if (char === "水") days.add("wed");
        if (char === "木") days.add("thu");
        if (char === "金") days.add("fri");
        if (char === "土") days.add("sat");
        if (char === "日") days.add("sun");
      }
    }
  }

  if (days.size === 0 && !/のみ/.test(original)) {
    for (const pattern of dayPatterns) {
      if (pattern.regex.test(value)) {
        days.add(pattern.day);
      }
    }
  }

  const ordered: SpotBusinessDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "holiday"];
  return ordered.filter((day) => days.has(day));
}

function parseSeasonalClosures(value: string | null): SpotSeasonalClosure[] {
  if (!value) return [];
  const text = value.trim();
  if (!text) return [];
  if (/^(なし|特になし|記載なし)$/i.test(text)) return [];

  const closures: SpotSeasonalClosure[] = [];
  const seen = new Set<string>();

  const dateRanges = text.matchAll(
    /(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})\s*[-〜～]\s*(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/g,
  );
  for (const match of dateRanges) {
    const startDate = `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
    const endDate = `${match[4]}-${String(Number(match[5])).padStart(2, "0")}-${String(Number(match[6])).padStart(2, "0")}`;
    const key = `date:${startDate}:${endDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    closures.push({
      startDate,
      endDate,
      startMonth: null,
      endMonth: null,
      note: text,
    });
  }

  const monthRanges = text.matchAll(/(\d{1,2})\s*月?\s*[-〜～]\s*(\d{1,2})\s*月/g);
  for (const match of monthRanges) {
    const startMonth = Number(match[1]);
    const endMonth = Number(match[2]);
    if (!Number.isFinite(startMonth) || !Number.isFinite(endMonth)) continue;
    if (startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12) continue;
    const key = `month:${startMonth}:${endMonth}`;
    if (seen.has(key)) continue;
    seen.add(key);
    closures.push({
      startDate: null,
      endDate: null,
      startMonth,
      endMonth,
      note: text,
    });
  }

  const mdRanges = text.matchAll(/(\d{1,2})\/(\d{1,2})\s*[-〜～]\s*(\d{1,2})\/(\d{1,2})/g);
  for (const match of mdRanges) {
    const startMonth = Number(match[1]);
    const endMonth = Number(match[3]);
    if (!Number.isFinite(startMonth) || !Number.isFinite(endMonth)) continue;
    if (startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12) continue;
    const key = `md:${startMonth}:${endMonth}`;
    if (seen.has(key)) continue;
    seen.add(key);
    closures.push({
      startDate: null,
      endDate: null,
      startMonth,
      endMonth,
      note: text,
    });
  }

  if (/冬季/.test(text)) {
    const key = "winter:12:2";
    if (!seen.has(key)) {
      seen.add(key);
      closures.push({
        startDate: null,
        endDate: null,
        startMonth: 12,
        endMonth: 2,
        note: text,
      });
    }
  }
  if (/年末年始/.test(text)) {
    const key = "newyear:12:1";
    if (!seen.has(key)) {
      seen.add(key);
      closures.push({
        startDate: null,
        endDate: null,
        startMonth: 12,
        endMonth: 1,
        note: text,
      });
    }
  }
  if (/GW|ゴールデンウィーク/i.test(text)) {
    const key = "gw:4:5";
    if (!seen.has(key)) {
      seen.add(key);
      closures.push({
        startDate: null,
        endDate: null,
        startMonth: 4,
        endMonth: 5,
        note: text,
      });
    }
  }
  if (/夏休み|夏季/.test(text)) {
    const key = "summer:7:8";
    if (!seen.has(key)) {
      seen.add(key);
      closures.push({
        startDate: null,
        endDate: null,
        startMonth: 7,
        endMonth: 8,
        note: text,
      });
    }
  }

  if (closures.length === 0 && !/なし|明記なし|確認できず|未確認/.test(text)) {
    closures.push({
      startDate: null,
      endDate: null,
      startMonth: null,
      endMonth: null,
      note: text,
    });
  }

  const deduped: SpotSeasonalClosure[] = [];
  const dedupeKeys = new Set<string>();
  for (const closure of closures) {
    const key = [
      closure.startDate ?? "",
      closure.endDate ?? "",
      closure.startMonth ?? "",
      closure.endMonth ?? "",
      closure.note ?? "",
    ].join("|");
    if (dedupeKeys.has(key)) continue;
    dedupeKeys.add(key);
    deduped.push(closure);
  }
  return deduped;
}

function parseLastAdmission(value: string | null): SpotLastAdmissionRule {
  if (!value) {
    return { type: "none", time: null, minutesBeforeClose: null, note: null };
  }
  const text = value.trim();
  if (!text || /該当なし/.test(text)) {
    return { type: "none", time: null, minutesBeforeClose: null, note: text || null };
  }

  const minuteMatch = text.match(/(\d{1,3})\s*分前/);
  if (minuteMatch?.[1]) {
    const minutes = Number(minuteMatch[1]);
    if (Number.isFinite(minutes) && minutes > 0) {
      return {
        type: "before_close",
        time: null,
        minutesBeforeClose: minutes,
        note: text,
      };
    }
  }

  const markerMatch = text.match(
    /(?:L\.?\s*O\.?|ラストオーダー|最終受付|最終入場|最終便|受付締切|予約締切)[^0-9]{0,12}([0-2]?\d[:：][0-5]\d)/i,
  );
  const markerTime = markerMatch?.[1] ? toHhmm(markerMatch[1]) : null;
  if (markerTime) {
    return {
      type: "fixed_time",
      time: markerTime,
      minutesBeforeClose: null,
      note: text,
    };
  }

  if (!/未公開|未確認|不明|確認できず/.test(text)) {
    const anyMatch = text.match(/([0-2]?\d[:：][0-5]\d)/);
    const anyTime = anyMatch?.[1] ? toHhmm(anyMatch[1]) : null;
    if (anyTime) {
      return {
        type: "fixed_time",
        time: anyTime,
        minutesBeforeClose: null,
        note: text,
      };
    }
  }

  return { type: "none", time: null, minutesBeforeClose: null, note: text };
}

function dedupeTextParts(parts: Array<string | null | undefined>): string | null {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const normalized = asString(part);
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out.length > 0 ? out.join(" / ") : null;
}

function resolveSlug(row: CsvRow): string | null {
  return asString(row.slug) ?? asString(row["\ufeffslug"]);
}

async function main() {
  const csvPath = resolveCsvPath();
  const db = getFirebaseAdminDb();
  const csvText = await readTextFile(csvPath, "utf8");
  const workbook = read(csvText, { type: "string", raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("CSV sheet is empty");
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("CSV sheet data is missing");
  const rows = utils.sheet_to_json<CsvRow>(sheet, { defval: "" });

  let updatedCount = 0;
  let skippedCount = 0;
  const skipped: Array<{ slug: string; reason: string }> = [];

  for (const [index, row] of rows.entries()) {
    const spotId = resolveSlug(row);
    if (!spotId) {
      skippedCount += 1;
      skipped.push({ slug: `(row:${index + 2})`, reason: "slug is empty" });
      continue;
    }

    const existing = await getSpotById({ db, spotId });
    if (!existing) {
      skippedCount += 1;
      skipped.push({ slug: spotId, reason: "spot not found in firestore" });
      continue;
    }

    const lastAdmissionText = asString(row.lastAdmission);
    const regularClosedText = asString(row.regularClosedDays);
    const seasonalText = asString(row.seasonalClosures);
    const confidence = asString(row.confidence)?.toLowerCase() ?? null;
    const notes = asString(row.notes);
    const hasIrregularExplicit = asBoolean(row.hasIrregularClosures);
    const weeklyHoursRaw = parseWeeklyHoursRaw(asString(row.weeklyHours));
    const weeklyHoursStructured = parseWeeklyHoursStructured(weeklyHoursRaw);
    const regularClosedDays = parseRegularClosedDays(regularClosedText);
    const seasonalClosures = parseSeasonalClosures(seasonalText);
    const lastAdmission = parseLastAdmission(lastAdmissionText);

    const hasIrregularClosures =
      hasIrregularExplicit ??
      /不定休|臨時|変則|通行止め|随時|要確認/.test(
        [regularClosedText, seasonalText, notes].filter((item): item is string => Boolean(item)).join(" / "),
      );

    const needsManualReview =
      UNRESOLVED_KEYWORDS.test(
        [lastAdmissionText, regularClosedText, seasonalText, notes]
          .filter((item): item is string => Boolean(item))
          .join(" / "),
      ) || confidence?.startsWith("low") === true;

    const sourceList = splitSourceList(asString(row.primarySources));
    const regularHolidayMergedText = dedupeTextParts([
      existing.business.regularHolidaysText,
      regularClosedText,
      seasonalText,
      notes,
    ]);

    const operationalOverride: SpotOperationalJudgement = {
      regularClosedDays,
      hasIrregularClosures,
      seasonalClosures,
      lastAdmission,
      flags: {
        hasRegularHolidayRule: regularClosedDays.length > 0 || hasIrregularClosures,
        hasSeasonalClosureRule: seasonalClosures.length > 0,
        hasLastAdmissionRule: lastAdmission.type !== "none",
      },
      needsManualReview,
      parserVersion: CSV_PARSER_VERSION,
      researchMeta: {
        confidence,
        notes,
        primarySources: sourceList,
        ...(Object.keys(weeklyHoursRaw).length > 0 ? { weeklyHoursRaw } : {}),
      },
    };

    const derived = deriveBusinessOperationalData({
      isAlwaysOpen: existing.business.isAlwaysOpen,
      openingHoursText: existing.business.openingHoursText,
      regularHolidaysText: regularHolidayMergedText,
      lastEntryTime: lastAdmission.type === "fixed_time" ? lastAdmission.time : existing.business.lastEntryTime,
      weeklyHours: weeklyHoursStructured ?? existing.business.weeklyHours,
      operationalJudgement: operationalOverride,
    });

    await updateSpot({
      db,
      spotId,
      patch: {
        business: {
          regularHolidaysText: regularHolidayMergedText,
          ...(weeklyHoursStructured ? { weeklyHours: weeklyHoursStructured } : {}),
          lastEntryTime: derived.lastEntryTime,
          operationalJudgement: derived.operationalJudgement,
        },
      },
    });

    updatedCount += 1;
    console.log(`[importSpotsMissingFieldsVerifiedCsv] updated ${spotId} (${index + 1}/${rows.length})`);
  }

  console.log(
    `[importSpotsMissingFieldsVerifiedCsv] completed file=${csvPath} totalRows=${rows.length} updated=${updatedCount} skipped=${skippedCount}`,
  );
  if (skipped.length > 0) {
    console.log(`[importSpotsMissingFieldsVerifiedCsv] skipped details: ${JSON.stringify(skipped, null, 2)}`);
  }
}

main().catch((error) => {
  console.error("[importSpotsMissingFieldsVerifiedCsv] failed", error);
  process.exitCode = 1;
});
