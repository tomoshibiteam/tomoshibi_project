import { z } from "zod";
export declare const transportNodeSeedSchema: z.ZodObject<{
    nodeId: z.ZodString;
    nodeType: z.ZodEnum<{
        station: "station";
        bus_stop: "bus_stop";
    }>;
    nameJa: z.ZodString;
    location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strip>;
    isOriginCandidate: z.ZodBoolean;
    isReturnCandidate: z.ZodBoolean;
    linkedSpotId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
}, z.core.$strict>;
export declare const transitCalendarSeedSchema: z.ZodObject<{
    calendarId: z.ZodString;
    nameJa: z.ZodString;
    dayTypes: z.ZodArray<z.ZodEnum<{
        mon: "mon";
        tue: "tue";
        wed: "wed";
        thu: "thu";
        fri: "fri";
        sat: "sat";
        sun: "sun";
        holiday: "holiday";
    }>>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        gtfsServiceIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const transitServiceSeedSchema: z.ZodObject<{
    serviceId: z.ZodString;
    mode: z.ZodEnum<{
        train: "train";
        bus: "bus";
    }>;
    operator: z.ZodString;
    lineName: z.ZodString;
    routeName: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    fromNodeId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    toNodeId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    isMajor: z.ZodBoolean;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        effectiveFromDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        bookingRules: z.ZodArray<z.ZodString>;
        routeShape: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        shoppingStops: z.ZodArray<z.ZodString>;
        remarks: z.ZodArray<z.ZodString>;
        routeVariantHints: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsRouteIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsDirectionIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsServiceIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const transitTripSeedSchema: z.ZodObject<{
    departAt: z.ZodString;
    arriveAt: z.ZodString;
    tripCode: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const transitEdgeScheduleSeedSchema: z.ZodObject<{
    edgeScheduleId: z.ZodString;
    serviceId: z.ZodString;
    mode: z.ZodEnum<{
        train: "train";
        bus: "bus";
    }>;
    fromNodeId: z.ZodString;
    toNodeId: z.ZodString;
    calendarId: z.ZodString;
    timezone: z.ZodEnum<{
        "Asia/Tokyo": "Asia/Tokyo";
    }>;
    trips: z.ZodArray<z.ZodObject<{
        departAt: z.ZodString;
        arriveAt: z.ZodString;
        tripCode: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
    }, z.core.$strict>>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
}, z.core.$strict>;
export declare const transitTripSchema: z.ZodObject<{
    departAt: z.ZodString;
    arriveAt: z.ZodString;
    departMinutes: z.ZodNumber;
    arriveMinutes: z.ZodNumber;
    durationMinutes: z.ZodNumber;
    tripCode: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    gtfsTripId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
    routeVariant: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
    isShoppingTrip: z.ZodOptional<z.ZodBoolean>;
    shoppingViaStops: z.ZodOptional<z.ZodArray<z.ZodString>>;
    reservationRuleType: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
    reservationRuleNote: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const transportNodeRecordSchema: z.ZodObject<{
    nodeId: z.ZodString;
    nodeType: z.ZodEnum<{
        station: "station";
        bus_stop: "bus_stop";
    }>;
    nameJa: z.ZodString;
    location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strip>;
    isOriginCandidate: z.ZodBoolean;
    isReturnCandidate: z.ZodBoolean;
    linkedSpotId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    source: z.ZodString;
    version: z.ZodNumber;
    importedAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const transitCalendarRecordSchema: z.ZodObject<{
    calendarId: z.ZodString;
    nameJa: z.ZodString;
    dayTypes: z.ZodArray<z.ZodEnum<{
        mon: "mon";
        tue: "tue";
        wed: "wed";
        thu: "thu";
        fri: "fri";
        sat: "sat";
        sun: "sun";
        holiday: "holiday";
    }>>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        gtfsServiceIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    source: z.ZodString;
    version: z.ZodNumber;
    importedAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const transitServiceRecordSchema: z.ZodObject<{
    serviceId: z.ZodString;
    mode: z.ZodEnum<{
        train: "train";
        bus: "bus";
    }>;
    operator: z.ZodString;
    lineName: z.ZodString;
    routeName: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    fromNodeId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    toNodeId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    isMajor: z.ZodBoolean;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        effectiveFromDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        bookingRules: z.ZodArray<z.ZodString>;
        routeShape: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        shoppingStops: z.ZodArray<z.ZodString>;
        remarks: z.ZodArray<z.ZodString>;
        routeVariantHints: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsRouteIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsDirectionIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsServiceIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
    source: z.ZodString;
    version: z.ZodNumber;
    importedAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const transitEdgeScheduleRecordSchema: z.ZodObject<{
    edgeScheduleId: z.ZodString;
    serviceId: z.ZodString;
    mode: z.ZodEnum<{
        train: "train";
        bus: "bus";
    }>;
    fromNodeId: z.ZodString;
    toNodeId: z.ZodString;
    calendarId: z.ZodString;
    timezone: z.ZodEnum<{
        "Asia/Tokyo": "Asia/Tokyo";
    }>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    trips: z.ZodArray<z.ZodObject<{
        departAt: z.ZodString;
        arriveAt: z.ZodString;
        departMinutes: z.ZodNumber;
        arriveMinutes: z.ZodNumber;
        durationMinutes: z.ZodNumber;
        tripCode: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        gtfsTripId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
        routeVariant: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
        isShoppingTrip: z.ZodOptional<z.ZodBoolean>;
        shoppingViaStops: z.ZodOptional<z.ZodArray<z.ZodString>>;
        reservationRuleType: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
        reservationRuleNote: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
    }, z.core.$strict>>;
    source: z.ZodString;
    version: z.ZodNumber;
    importedAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const transportNodeSeedArraySchema: z.ZodArray<z.ZodObject<{
    nodeId: z.ZodString;
    nodeType: z.ZodEnum<{
        station: "station";
        bus_stop: "bus_stop";
    }>;
    nameJa: z.ZodString;
    location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strip>;
    isOriginCandidate: z.ZodBoolean;
    isReturnCandidate: z.ZodBoolean;
    linkedSpotId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
}, z.core.$strict>>;
export declare const transitCalendarSeedArraySchema: z.ZodArray<z.ZodObject<{
    calendarId: z.ZodString;
    nameJa: z.ZodString;
    dayTypes: z.ZodArray<z.ZodEnum<{
        mon: "mon";
        tue: "tue";
        wed: "wed";
        thu: "thu";
        fri: "fri";
        sat: "sat";
        sun: "sun";
        holiday: "holiday";
    }>>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        gtfsServiceIds: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>>;
export declare const transitServiceSeedArraySchema: z.ZodArray<z.ZodObject<{
    serviceId: z.ZodString;
    mode: z.ZodEnum<{
        train: "train";
        bus: "bus";
    }>;
    operator: z.ZodString;
    lineName: z.ZodString;
    routeName: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    fromNodeId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    toNodeId: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    isMajor: z.ZodBoolean;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        effectiveFromDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        bookingRules: z.ZodArray<z.ZodString>;
        routeShape: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        shoppingStops: z.ZodArray<z.ZodString>;
        remarks: z.ZodArray<z.ZodString>;
        routeVariantHints: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsRouteIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsDirectionIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        gtfsServiceIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
}, z.core.$strict>>;
export declare const transitEdgeScheduleSeedArraySchema: z.ZodArray<z.ZodObject<{
    edgeScheduleId: z.ZodString;
    serviceId: z.ZodString;
    mode: z.ZodEnum<{
        train: "train";
        bus: "bus";
    }>;
    fromNodeId: z.ZodString;
    toNodeId: z.ZodString;
    calendarId: z.ZodString;
    timezone: z.ZodEnum<{
        "Asia/Tokyo": "Asia/Tokyo";
    }>;
    trips: z.ZodArray<z.ZodObject<{
        departAt: z.ZodString;
        arriveAt: z.ZodString;
        tripCode: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
    }, z.core.$strict>>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
}, z.core.$strict>>;
export declare const busStopCandidateSeedSchema: z.ZodObject<{
    candidateId: z.ZodString;
    serviceId: z.ZodString;
    lineName: z.ZodString;
    stopOrder: z.ZodNumber;
    nameJa: z.ZodString;
    location: z.ZodUnion<readonly [z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strict>, z.ZodNull]>;
    locationStatus: z.ZodEnum<{
        exact: "exact";
        pending: "pending";
        approx: "approx";
    }>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
}, z.core.$strict>;
export declare const busStopCandidateRecordSchema: z.ZodObject<{
    candidateId: z.ZodString;
    serviceId: z.ZodString;
    lineName: z.ZodString;
    stopOrder: z.ZodNumber;
    nameJa: z.ZodString;
    location: z.ZodUnion<readonly [z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strict>, z.ZodNull]>;
    locationStatus: z.ZodEnum<{
        exact: "exact";
        pending: "pending";
        approx: "approx";
    }>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    source: z.ZodString;
    version: z.ZodNumber;
    importedAt: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const busStopCandidateSeedArraySchema: z.ZodArray<z.ZodObject<{
    candidateId: z.ZodString;
    serviceId: z.ZodString;
    lineName: z.ZodString;
    stopOrder: z.ZodNumber;
    nameJa: z.ZodString;
    location: z.ZodUnion<readonly [z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, z.core.$strict>, z.ZodNull]>;
    locationStatus: z.ZodEnum<{
        exact: "exact";
        pending: "pending";
        approx: "approx";
    }>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
}, z.core.$strict>>;
