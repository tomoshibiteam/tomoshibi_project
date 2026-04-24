import { transitEdgeScheduleRecordSchema, transitServiceRecordSchema } from "../../schemas";
import type { MappedTransitData } from "./types";

const ODA_RESERVATION_RULE_TYPE = "partial_no_reservation";
const ODA_RESERVATION_RULE_NOTE = "平日9:30まで・15:00以降の便は予約不要（その他は予約便あり）";

function normalize(value: string): string {
  return value.replace(/[\s　]/g, "").toLowerCase();
}

function includesAny(targets: string[], keywords: string[]): boolean {
  const normalizedTargets = targets.map(normalize);
  return keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    return normalizedTargets.some((target) => target.includes(normalizedKeyword));
  });
}

function inferRouteVariant(params: { serviceId: string; stopNames: string[] }): string | null {
  if (params.serviceId === "bus_iwami_oda_line") {
    return "oda";
  }

  if (params.serviceId !== "bus_iwami_tago_kugami_line") {
    return null;
  }

  const hasTago = includesAny(params.stopNames, ["田後"]);
  const hasKugamiSide = includesAny(params.stopNames, ["西陸上", "東浜駅", "公民館前", "海と大地の自然館前", "陸上"]);

  if (hasTago && hasKugamiSide) return "tago_to_kugami";
  if (hasTago && !hasKugamiSide) return "tago_terminating";
  if (!hasTago && hasKugamiSide) return "kugami_direct";
  return null;
}

function isShoppingTrip(stopNames: string[]): { value: boolean; viaStops: string[] } {
  const hasSunmart = includesAny(stopNames, ["サンマート岩美店"]);
  const hasKinanse = includesAny(stopNames, ["道の駅きなんせ岩美"]);

  if (hasSunmart && hasKinanse) {
    return {
      value: true,
      viaStops: ["サンマート岩美店", "道の駅きなんせ岩美"],
    };
  }

  return { value: false, viaStops: [] };
}

export function applyGtfsOverlays(input: MappedTransitData): MappedTransitData {
  const services = input.transitServices.map((service) => {
    if (service.serviceId === "bus_iwami_oda_line") {
      return transitServiceRecordSchema.parse({
        ...service,
        metadata: {
          ...(service.metadata ?? {
            effectiveFromDate: null,
            bookingRules: [],
            routeShape: null,
            shoppingStops: [],
            remarks: [],
          }),
          bookingRules: [
            "平日は小田または岩美駅の出発時刻が9:30までの便は予約不要",
            "平日は小田または岩美駅の出発時刻が15:00以降の便は予約不要",
          ],
          remarks: Array.from(new Set([...(service.metadata?.remarks ?? []), "令和8年4月1日改正"])),
          routeVariantHints: Array.from(new Set([...(service.metadata?.routeVariantHints ?? []), "oda"])),
        },
      });
    }

    if (service.serviceId === "bus_iwami_tago_kugami_line") {
      return transitServiceRecordSchema.parse({
        ...service,
        metadata: {
          ...(service.metadata ?? {
            effectiveFromDate: null,
            bookingRules: [],
            routeShape: null,
            shoppingStops: [],
            remarks: [],
          }),
          routeShape: "Y字型（田後止め・陸上直通）",
          shoppingStops: Array.from(
            new Set([...(service.metadata?.shoppingStops ?? []), "サンマート岩美店", "道の駅きなんせ岩美"]),
          ),
          remarks: Array.from(new Set([...(service.metadata?.remarks ?? []), "買い物便あり", "令和8年4月1日改正"])),
          routeVariantHints: Array.from(
            new Set([...(service.metadata?.routeVariantHints ?? []), "tago_terminating", "tago_to_kugami", "kugami_direct"]),
          ),
        },
      });
    }

    return service;
  });

  const edgeSchedules = input.transitEdgeSchedules.map((schedule) => {
    const trips = schedule.trips.map((trip) => {
      const tripId = trip.gtfsTripId;
      if (!tripId) return trip;
      const context = input.tripContextsByGtfsTripId[tripId];
      if (!context) return trip;

      const routeVariant = inferRouteVariant({ serviceId: context.serviceId, stopNames: context.stopNames });
      const shopping = isShoppingTrip(context.stopNames);
      const isOda = context.serviceId === "bus_iwami_oda_line";

      return {
        ...trip,
        routeVariant,
        isShoppingTrip: shopping.value,
        shoppingViaStops: shopping.viaStops,
        reservationRuleType: isOda ? ODA_RESERVATION_RULE_TYPE : trip.reservationRuleType ?? null,
        reservationRuleNote: isOda ? ODA_RESERVATION_RULE_NOTE : trip.reservationRuleNote ?? null,
      };
    });

    return transitEdgeScheduleRecordSchema.parse({
      ...schedule,
      trips,
    });
  });

  return {
    ...input,
    transitServices: services,
    transitEdgeSchedules: edgeSchedules,
  };
}
