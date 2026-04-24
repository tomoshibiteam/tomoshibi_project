"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveBusinessOperationalData = deriveBusinessOperationalData;
const PARSER_VERSION = 1;
const ALL_WEEK_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "holiday"];
const DEFAULT_OPERATIONAL_JUDGEMENT = {
    regularClosedDays: [],
    hasIrregularClosures: false,
    seasonalClosures: [],
    lastAdmission: {
        type: "none",
        time: null,
        minutesBeforeClose: null,
        note: null,
    },
    flags: {
        hasRegularHolidayRule: false,
        hasSeasonalClosureRule: false,
        hasLastAdmissionRule: false,
    },
    needsManualReview: false,
    parserVersion: PARSER_VERSION,
};
function normalizeText(value) {
    if (value == null)
        return "";
    return value.replace(/\s+/g, " ").trim();
}
function toHhmm(raw) {
    const normalized = raw.replace(/[：]/g, ":").trim();
    const match = normalized.match(/^([0-2]?\d):([0-5]\d)$/);
    if (!match)
        return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23)
        return null;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
function parseDayToken(rawToken) {
    const token = rawToken.toLowerCase().replace(/[^a-z\u3040-\u30ff\u4e00-\u9fff]/g, "");
    if (!token)
        return null;
    if (token.includes("holiday") || token.includes("祝"))
        return "holiday";
    if (token.startsWith("mon") || token.includes("月"))
        return "mon";
    if (token.startsWith("tue") || token.includes("火"))
        return "tue";
    if (token.startsWith("wed") || token.includes("水"))
        return "wed";
    if (token.startsWith("thu") || token.includes("木"))
        return "thu";
    if (token.startsWith("fri") || token.includes("金"))
        return "fri";
    if (token.startsWith("sat") || token.includes("土"))
        return "sat";
    if (token.startsWith("sun") || token.includes("日"))
        return "sun";
    return null;
}
function parseDayRange(fromDay, toDay) {
    const fromIndex = ALL_WEEK_DAYS.indexOf(fromDay);
    const toIndex = ALL_WEEK_DAYS.indexOf(toDay);
    if (fromIndex === -1 || toIndex === -1)
        return [];
    if (fromIndex <= toIndex) {
        return ALL_WEEK_DAYS.slice(fromIndex, toIndex + 1);
    }
    return [...ALL_WEEK_DAYS.slice(fromIndex), ...ALL_WEEK_DAYS.slice(0, toIndex + 1)];
}
function parseDaysFromExpression(rawExpression) {
    const expression = rawExpression
        .replace(/曜日/g, "")
        .replace(/曜/g, "")
        .replace(/[()]/g, " ")
        .trim();
    if (!expression)
        return [];
    const lower = expression.toLowerCase();
    if (/(daily|everyday|毎日|全日|無休)/i.test(lower)) {
        return [...ALL_WEEK_DAYS];
    }
    const normalized = expression.replace(/[、，・]/g, "/");
    const parts = normalized.split("/").map((part) => part.trim());
    const days = new Set();
    for (const part of parts) {
        if (!part)
            continue;
        const rangeMatch = part.match(/^(.+?)[\-〜～](.+)$/);
        if (rangeMatch) {
            const startDay = parseDayToken(rangeMatch[1]);
            const endDay = parseDayToken(rangeMatch[2]);
            if (!startDay || !endDay)
                continue;
            if (startDay === "holiday" || endDay === "holiday")
                continue;
            for (const day of parseDayRange(startDay, endDay))
                days.add(day);
            continue;
        }
        const tokenDay = parseDayToken(part);
        if (tokenDay)
            days.add(tokenDay);
    }
    return [...days];
}
function dedupeDays(days) {
    const seen = new Set();
    const out = [];
    for (const day of DAY_ORDER) {
        if (!days.includes(day))
            continue;
        if (seen.has(day))
            continue;
        seen.add(day);
        out.push(day);
    }
    return out;
}
function extractClosedDays(text) {
    const out = [];
    const englishMatches = text.matchAll(/([A-Za-z\s\/,\-〜～]+?)\s*(?:regular\s*)?closed(?:\b|[^a-z])/gi);
    for (const match of englishMatches) {
        const expression = (match[1] ?? "").trim();
        out.push(...parseDaysFromExpression(expression));
    }
    const japaneseMatches = text.matchAll(/([月火水木金土日](?:曜(?:日)?)?(?:[\/、，・\-〜～]?[月火水木金土日](?:曜(?:日)?)?)*)\s*(?:定休|休館|休業|休み|休)/g);
    for (const match of japaneseMatches) {
        const expression = (match[1] ?? "").trim();
        out.push(...parseDaysFromExpression(expression));
    }
    return dedupeDays(out);
}
function parseTimeRanges(rawText) {
    const ranges = [];
    const rangeMatches = rawText.matchAll(/([0-2]?\d[:：][0-5]\d)\s*[-〜～]\s*([0-2]?\d[:：][0-5]\d)/g);
    for (const match of rangeMatches) {
        const open = toHhmm(match[1] ?? "");
        const close = toHhmm(match[2] ?? "");
        if (!open || !close)
            continue;
        if (open >= close)
            continue;
        ranges.push({ open, close });
    }
    return ranges;
}
function parseWeeklyHoursFromNarrative(input) {
    if (input.isAlwaysOpen)
        return undefined;
    const weeklyHours = {};
    const segments = input.weeklyText
        .split(/[;\n]/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
    for (const segment of segments) {
        const timeRanges = parseTimeRanges(segment);
        if (timeRanges.length === 0)
            continue;
        const rangeIndex = segment.search(/[0-2]?\d[:：][0-5]\d\s*[-〜～]\s*[0-2]?\d[:：][0-5]\d/);
        const dayExpression = rangeIndex >= 0 ? segment.slice(0, rangeIndex).trim() : segment;
        const parsedDays = parseDaysFromExpression(dayExpression);
        const targetDays = parsedDays.length > 0 ? parsedDays : [...ALL_WEEK_DAYS];
        for (const day of targetDays) {
            if (day === "holiday")
                continue;
            const key = day;
            const nextRanges = [...(weeklyHours[key] ?? []), ...timeRanges];
            weeklyHours[key] = nextRanges;
        }
    }
    if (Object.keys(weeklyHours).length > 0) {
        return weeklyHours;
    }
    if (/(チェックイン|チェックアウト|運行時間帯|準拠|予約制|通行止め|立入不可|カレンダー制|随時対応)/.test(input.openingText)) {
        return undefined;
    }
    const openingRanges = parseTimeRanges(input.openingText);
    if (openingRanges.length === 0)
        return undefined;
    const primaryRange = openingRanges.reduce((best, current) => {
        const bestDuration = Number(best.close.slice(0, 2)) * 60 + Number(best.close.slice(3)) - (Number(best.open.slice(0, 2)) * 60 + Number(best.open.slice(3)));
        const currentDuration = Number(current.close.slice(0, 2)) * 60 +
            Number(current.close.slice(3)) -
            (Number(current.open.slice(0, 2)) * 60 + Number(current.open.slice(3)));
        return currentDuration > bestDuration ? current : best;
    });
    const closedSet = new Set(input.closedDays.filter((day) => day !== "holiday"));
    for (const day of ALL_WEEK_DAYS) {
        if (closedSet.has(day))
            continue;
        weeklyHours[day] = [primaryRange];
    }
    return Object.keys(weeklyHours).length > 0 ? weeklyHours : undefined;
}
function extractSeasonalClosures(text) {
    const closures = [];
    const seen = new Set();
    const sentences = text
        .split(/[。\n]/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 0);
    for (const sentence of sentences) {
        if (!/(休業|休館|休止|利用不可|運休|冬季|夏季|年末年始|GW)/.test(sentence))
            continue;
        const fixedRangeMatches = sentence.matchAll(/(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})\s*[-〜～]\s*(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/g);
        for (const match of fixedRangeMatches) {
            const startDate = `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
            const endDate = `${match[4]}-${String(Number(match[5])).padStart(2, "0")}-${String(Number(match[6])).padStart(2, "0")}`;
            const key = `fixed:${startDate}:${endDate}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            closures.push({
                startDate,
                endDate,
                startMonth: null,
                endMonth: null,
                note: sentence,
            });
        }
        const monthRangeMatches = sentence.matchAll(/(\d{1,2})\s*月?\s*[-〜～]\s*(\d{1,2})\s*月(?:末)?/g);
        for (const match of monthRangeMatches) {
            const startMonth = Number(match[1]);
            const endMonth = Number(match[2]);
            if (!Number.isFinite(startMonth) || !Number.isFinite(endMonth))
                continue;
            if (startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12)
                continue;
            const key = `month:${startMonth}:${endMonth}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            closures.push({
                startDate: null,
                endDate: null,
                startMonth,
                endMonth,
                note: sentence,
            });
        }
        if (/(冬季休業|夏季休業|年末年始|GW)/.test(sentence) && !/[0-9]/.test(sentence)) {
            const key = `note:${sentence}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            closures.push({
                startDate: null,
                endDate: null,
                startMonth: sentence.includes("冬季") ? 12 : null,
                endMonth: sentence.includes("冬季") ? 2 : null,
                note: sentence,
            });
        }
    }
    return closures;
}
function deriveLastAdmission(input) {
    const explicit = toHhmm(input.explicitLastEntryTime ?? "");
    if (explicit) {
        return {
            type: "fixed_time",
            time: explicit,
            minutesBeforeClose: null,
            note: "manual_or_existing",
        };
    }
    const mergedText = `${input.openingText} ${input.regularHolidayText}`.trim();
    if (!mergedText)
        return { ...DEFAULT_OPERATIONAL_JUDGEMENT.lastAdmission };
    const minuteRuleMatch = mergedText.match(/(?:閉館|閉店|終了)\s*(\d{1,2})\s*分前/);
    if (minuteRuleMatch?.[1]) {
        const minutes = Number(minuteRuleMatch[1]);
        if (Number.isFinite(minutes) && minutes >= 1) {
            return {
                type: "before_close",
                time: null,
                minutesBeforeClose: minutes,
                note: minuteRuleMatch[0],
            };
        }
    }
    const timeMatch = mergedText.match(/(?:L\.?\s*O\.?|ラストオーダー)\s*[:：]?\s*([0-2]?\d[:：][0-5]\d)/i) ??
        mergedText.match(/(?:最終受付|最終入場|最終入館|受付)\s*[:：]?\s*([0-2]?\d[:：][0-5]\d)/i) ??
        mergedText.match(/受付\s*([0-2]?\d[:：][0-5]\d)\s*まで/i);
    const parsedTime = timeMatch?.[1] ? toHhmm(timeMatch[1]) : null;
    if (!parsedTime)
        return { ...DEFAULT_OPERATIONAL_JUDGEMENT.lastAdmission };
    return {
        type: "fixed_time",
        time: parsedTime,
        minutesBeforeClose: null,
        note: timeMatch?.[0] ?? "parsed",
    };
}
function hasManualReviewKeywords(text) {
    return /(要確認|不定休|臨時|変動|カレンダー制|通行止め|立入不可|貸切|別管理|可能性|相談可|予約制|一時中断|休止)/.test(text);
}
function mergeOperationalJudgement(base, override) {
    if (!override)
        return base;
    return {
        ...base,
        ...override,
        regularClosedDays: dedupeDays(override.regularClosedDays),
        seasonalClosures: override.seasonalClosures,
        lastAdmission: override.lastAdmission ?? base.lastAdmission,
        flags: {
            ...base.flags,
            ...(override.flags ?? {}),
        },
        parserVersion: override.parserVersion >= 1 ? override.parserVersion : base.parserVersion,
    };
}
function deriveBusinessOperationalData(input) {
    const openingText = normalizeText(input.openingHoursText);
    const regularHolidayText = normalizeText(input.regularHolidaysText);
    const mergedText = [openingText, regularHolidayText].filter((value) => value.length > 0).join(" ");
    const regularClosedDays = dedupeDays(extractClosedDays(mergedText));
    const weeklyHours = input.weeklyHours ??
        parseWeeklyHoursFromNarrative({
            isAlwaysOpen: input.isAlwaysOpen,
            weeklyText: regularHolidayText,
            openingText,
            closedDays: regularClosedDays,
        });
    const seasonalClosures = extractSeasonalClosures(mergedText);
    const lastAdmission = deriveLastAdmission({
        explicitLastEntryTime: input.lastEntryTime,
        openingText,
        regularHolidayText,
    });
    const hasIrregularClosures = /不定休/.test(mergedText);
    const hasStructuredHours = Boolean(weeklyHours && Object.keys(weeklyHours).length > 0);
    const needsManualReview = hasManualReviewKeywords(mergedText) || (!input.isAlwaysOpen && !hasStructuredHours && openingText.length > 0);
    const generated = {
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
        parserVersion: PARSER_VERSION,
    };
    return {
        weeklyHours,
        lastEntryTime: lastAdmission.type === "fixed_time" ? lastAdmission.time : input.lastEntryTime,
        operationalJudgement: mergeOperationalJudgement(generated, input.operationalJudgement),
    };
}
//# sourceMappingURL=businessRules.js.map