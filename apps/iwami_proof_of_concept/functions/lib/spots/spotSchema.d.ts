import { z } from "zod";
export declare const spotNearestStationSchema: z.ZodObject<{
    stationId: z.ZodString;
    stationName: z.ZodString;
    distanceMeters: z.ZodNumber;
    walkMinutes: z.ZodNumber;
}, z.core.$strip>;
export declare const spotLocationSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    geohash: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    addressJa: z.ZodString;
    areaName: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    stationAreaType: z.ZodEnum<{
        none: "none";
        iwami_station_area: "iwami_station_area";
        higashihama_station_area: "higashihama_station_area";
        oiwa_station_area: "oiwa_station_area";
    }>;
}, z.core.$strip>;
export declare const spotBusinessSchema: z.ZodObject<{
    isAlwaysOpen: z.ZodBoolean;
    openingHoursText: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    regularHolidaysText: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    reservationRequired: z.ZodDefault<z.ZodBoolean>;
    lastEntryTime: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    estimatedStayMinutesMin: z.ZodNumber;
    estimatedStayMinutesMax: z.ZodNumber;
    weeklyHours: z.ZodOptional<z.ZodObject<{
        mon: z.ZodOptional<z.ZodArray<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, z.core.$strip>>>;
        tue: z.ZodOptional<z.ZodArray<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, z.core.$strip>>>;
        wed: z.ZodOptional<z.ZodArray<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, z.core.$strip>>>;
        thu: z.ZodOptional<z.ZodArray<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, z.core.$strip>>>;
        fri: z.ZodOptional<z.ZodArray<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, z.core.$strip>>>;
        sat: z.ZodOptional<z.ZodArray<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, z.core.$strip>>>;
        sun: z.ZodOptional<z.ZodArray<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    operationalJudgement: z.ZodOptional<z.ZodObject<{
        regularClosedDays: z.ZodArray<z.ZodEnum<{
            mon: "mon";
            tue: "tue";
            wed: "wed";
            thu: "thu";
            fri: "fri";
            sat: "sat";
            sun: "sun";
            holiday: "holiday";
        }>>;
        hasIrregularClosures: z.ZodDefault<z.ZodBoolean>;
        seasonalClosures: z.ZodDefault<z.ZodArray<z.ZodObject<{
            startDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            endDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            startMonth: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
            endMonth: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
            note: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        }, z.core.$strip>>>;
        lastAdmission: z.ZodObject<{
            type: z.ZodEnum<{
                none: "none";
                fixed_time: "fixed_time";
                before_close: "before_close";
            }>;
            time: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            minutesBeforeClose: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
            note: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        }, z.core.$strip>;
        flags: z.ZodObject<{
            hasRegularHolidayRule: z.ZodDefault<z.ZodBoolean>;
            hasSeasonalClosureRule: z.ZodDefault<z.ZodBoolean>;
            hasLastAdmissionRule: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        needsManualReview: z.ZodDefault<z.ZodBoolean>;
        parserVersion: z.ZodNumber;
        researchMeta: z.ZodOptional<z.ZodObject<{
            confidence: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            notes: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            primarySources: z.ZodArray<z.ZodString>;
            weeklyHoursRaw: z.ZodOptional<z.ZodObject<{
                mon: z.ZodOptional<z.ZodString>;
                tue: z.ZodOptional<z.ZodString>;
                wed: z.ZodOptional<z.ZodString>;
                thu: z.ZodOptional<z.ZodString>;
                fri: z.ZodOptional<z.ZodString>;
                sat: z.ZodOptional<z.ZodString>;
                sun: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const spotPricingSchema: z.ZodObject<{
    priceType: z.ZodEnum<{
        free: "free";
        unknown: "unknown";
        paid: "paid";
        purchase_optional: "purchase_optional";
    }>;
    priceLabel: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
    priceMinYen: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
    priceMaxYen: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
}, z.core.$strip>;
export declare const spotAccessSchema: z.ZodObject<{
    supportedTransports: z.ZodArray<z.ZodEnum<{
        train: "train";
        car: "car";
        walk: "walk";
        rental_cycle: "rental_cycle";
        bus: "bus";
    }>>;
    parkingAvailable: z.ZodDefault<z.ZodBoolean>;
    bikeParkingAvailable: z.ZodDefault<z.ZodBoolean>;
    busStopNearby: z.ZodDefault<z.ZodBoolean>;
    requiresFirstStop: z.ZodDefault<z.ZodBoolean>;
    requiredFirstStopReason: z.ZodDefault<z.ZodUnion<readonly [z.ZodEnum<{
        rental_cycle_pickup: "rental_cycle_pickup";
        ticket_exchange: "ticket_exchange";
        checkin_required: "checkin_required";
        other: "other";
    }>, z.ZodNull]>>;
}, z.core.$strip>;
export declare const spotPlannerAttributesSchema: z.ZodObject<{
    themes: z.ZodArray<z.ZodString>;
    moodTags: z.ZodArray<z.ZodString>;
    weatherSuitability: z.ZodObject<{
        sunny: z.ZodEnum<{
            good: "good";
            ok: "ok";
            bad: "bad";
        }>;
        cloudy: z.ZodEnum<{
            good: "good";
            ok: "ok";
            bad: "bad";
        }>;
        rainy: z.ZodEnum<{
            good: "good";
            ok: "ok";
            bad: "bad";
        }>;
        windy: z.ZodEnum<{
            good: "good";
            ok: "ok";
            bad: "bad";
        }>;
    }, z.core.$strip>;
    timeOfDaySuitability: z.ZodArray<z.ZodEnum<{
        morning: "morning";
        daytime: "daytime";
        sunset: "sunset";
        night: "night";
    }>>;
    visitPace: z.ZodArray<z.ZodEnum<{
        short_stop: "short_stop";
        normal_stop: "normal_stop";
        long_stay: "long_stay";
    }>>;
    withWho: z.ZodArray<z.ZodEnum<{
        solo: "solo";
        friends: "friends";
        couple: "couple";
        family: "family";
    }>>;
    physicalLoad: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>;
    indoorOutdoor: z.ZodEnum<{
        indoor: "indoor";
        outdoor: "outdoor";
        mixed: "mixed";
    }>;
    rainFallbackCandidate: z.ZodBoolean;
    photoSpotScore: z.ZodNumber;
    scenicScore: z.ZodNumber;
    foodScore: z.ZodNumber;
    shoppingScore: z.ZodNumber;
    experienceScore: z.ZodNumber;
    stationStopoverScore: z.ZodNumber;
    priorityScore: z.ZodNumber;
}, z.core.$strip>;
export declare const spotAiContextSchema: z.ZodObject<{
    plannerSummary: z.ZodString;
    whyVisit: z.ZodArray<z.ZodString>;
    bestFor: z.ZodArray<z.ZodString>;
    avoidIf: z.ZodArray<z.ZodString>;
    sampleUseCases: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const spotWriteInputSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    slug: z.ZodString;
    nameJa: z.ZodString;
    nameEn: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    shortName: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
        archived: "archived";
    }>;
    primaryCategory: z.ZodEnum<{
        see: "see";
        eat: "eat";
        shop: "shop";
        stay: "stay";
        experience: "experience";
    }>;
    secondaryCategories: z.ZodArray<z.ZodString>;
    tags: z.ZodArray<z.ZodString>;
    location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        geohash: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        addressJa: z.ZodString;
        areaName: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        stationAreaType: z.ZodEnum<{
            none: "none";
            iwami_station_area: "iwami_station_area";
            higashihama_station_area: "higashihama_station_area";
            oiwa_station_area: "oiwa_station_area";
        }>;
    }, z.core.$strip>;
    nearestStations: z.ZodArray<z.ZodObject<{
        stationId: z.ZodString;
        stationName: z.ZodString;
        distanceMeters: z.ZodNumber;
        walkMinutes: z.ZodNumber;
    }, z.core.$strip>>;
    descriptionShort: z.ZodString;
    descriptionLong: z.ZodString;
    heroImageUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    galleryImageUrls: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    thumbnailUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    websiteUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    instagramUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    phoneNumber: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    operatorName: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    business: z.ZodObject<{
        isAlwaysOpen: z.ZodBoolean;
        openingHoursText: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        regularHolidaysText: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        reservationRequired: z.ZodDefault<z.ZodBoolean>;
        lastEntryTime: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        estimatedStayMinutesMin: z.ZodNumber;
        estimatedStayMinutesMax: z.ZodNumber;
        weeklyHours: z.ZodOptional<z.ZodObject<{
            mon: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            tue: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            wed: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            thu: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            fri: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            sat: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            sun: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        operationalJudgement: z.ZodOptional<z.ZodObject<{
            regularClosedDays: z.ZodArray<z.ZodEnum<{
                mon: "mon";
                tue: "tue";
                wed: "wed";
                thu: "thu";
                fri: "fri";
                sat: "sat";
                sun: "sun";
                holiday: "holiday";
            }>>;
            hasIrregularClosures: z.ZodDefault<z.ZodBoolean>;
            seasonalClosures: z.ZodDefault<z.ZodArray<z.ZodObject<{
                startDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                endDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                startMonth: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
                endMonth: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
                note: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            }, z.core.$strip>>>;
            lastAdmission: z.ZodObject<{
                type: z.ZodEnum<{
                    none: "none";
                    fixed_time: "fixed_time";
                    before_close: "before_close";
                }>;
                time: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                minutesBeforeClose: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
                note: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            }, z.core.$strip>;
            flags: z.ZodObject<{
                hasRegularHolidayRule: z.ZodDefault<z.ZodBoolean>;
                hasSeasonalClosureRule: z.ZodDefault<z.ZodBoolean>;
                hasLastAdmissionRule: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>;
            needsManualReview: z.ZodDefault<z.ZodBoolean>;
            parserVersion: z.ZodNumber;
            researchMeta: z.ZodOptional<z.ZodObject<{
                confidence: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                notes: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                primarySources: z.ZodArray<z.ZodString>;
                weeklyHoursRaw: z.ZodOptional<z.ZodObject<{
                    mon: z.ZodOptional<z.ZodString>;
                    tue: z.ZodOptional<z.ZodString>;
                    wed: z.ZodOptional<z.ZodString>;
                    thu: z.ZodOptional<z.ZodString>;
                    fri: z.ZodOptional<z.ZodString>;
                    sat: z.ZodOptional<z.ZodString>;
                    sun: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    pricing: z.ZodObject<{
        priceType: z.ZodEnum<{
            free: "free";
            unknown: "unknown";
            paid: "paid";
            purchase_optional: "purchase_optional";
        }>;
        priceLabel: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        priceMinYen: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
        priceMaxYen: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
    }, z.core.$strip>;
    access: z.ZodObject<{
        supportedTransports: z.ZodArray<z.ZodEnum<{
            train: "train";
            car: "car";
            walk: "walk";
            rental_cycle: "rental_cycle";
            bus: "bus";
        }>>;
        parkingAvailable: z.ZodDefault<z.ZodBoolean>;
        bikeParkingAvailable: z.ZodDefault<z.ZodBoolean>;
        busStopNearby: z.ZodDefault<z.ZodBoolean>;
        requiresFirstStop: z.ZodDefault<z.ZodBoolean>;
        requiredFirstStopReason: z.ZodDefault<z.ZodUnion<readonly [z.ZodEnum<{
            rental_cycle_pickup: "rental_cycle_pickup";
            ticket_exchange: "ticket_exchange";
            checkin_required: "checkin_required";
            other: "other";
        }>, z.ZodNull]>>;
    }, z.core.$strip>;
    plannerAttributes: z.ZodObject<{
        themes: z.ZodArray<z.ZodString>;
        moodTags: z.ZodArray<z.ZodString>;
        weatherSuitability: z.ZodObject<{
            sunny: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
            cloudy: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
            rainy: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
            windy: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
        }, z.core.$strip>;
        timeOfDaySuitability: z.ZodArray<z.ZodEnum<{
            morning: "morning";
            daytime: "daytime";
            sunset: "sunset";
            night: "night";
        }>>;
        visitPace: z.ZodArray<z.ZodEnum<{
            short_stop: "short_stop";
            normal_stop: "normal_stop";
            long_stay: "long_stay";
        }>>;
        withWho: z.ZodArray<z.ZodEnum<{
            solo: "solo";
            friends: "friends";
            couple: "couple";
            family: "family";
        }>>;
        physicalLoad: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
        indoorOutdoor: z.ZodEnum<{
            indoor: "indoor";
            outdoor: "outdoor";
            mixed: "mixed";
        }>;
        rainFallbackCandidate: z.ZodBoolean;
        photoSpotScore: z.ZodNumber;
        scenicScore: z.ZodNumber;
        foodScore: z.ZodNumber;
        shoppingScore: z.ZodNumber;
        experienceScore: z.ZodNumber;
        stationStopoverScore: z.ZodNumber;
        priorityScore: z.ZodNumber;
    }, z.core.$strip>;
    aiContext: z.ZodObject<{
        plannerSummary: z.ZodString;
        whyVisit: z.ZodArray<z.ZodString>;
        bestFor: z.ZodArray<z.ZodString>;
        avoidIf: z.ZodArray<z.ZodString>;
        sampleUseCases: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    relatedSpotIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    campaignCompatible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    couponCompatible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    storyCompatible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    source: z.ZodEnum<{
        manual: "manual";
        import_csv: "import_csv";
        import_json: "import_json";
    }>;
    lastReviewedAt: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    searchText: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$strict>;
export declare const spotRecordSchema: z.ZodObject<{
    slug: z.ZodString;
    nameJa: z.ZodString;
    nameEn: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    shortName: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
        archived: "archived";
    }>;
    primaryCategory: z.ZodEnum<{
        see: "see";
        eat: "eat";
        shop: "shop";
        stay: "stay";
        experience: "experience";
    }>;
    secondaryCategories: z.ZodArray<z.ZodString>;
    tags: z.ZodArray<z.ZodString>;
    location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        geohash: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        addressJa: z.ZodString;
        areaName: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        stationAreaType: z.ZodEnum<{
            none: "none";
            iwami_station_area: "iwami_station_area";
            higashihama_station_area: "higashihama_station_area";
            oiwa_station_area: "oiwa_station_area";
        }>;
    }, z.core.$strip>;
    nearestStations: z.ZodArray<z.ZodObject<{
        stationId: z.ZodString;
        stationName: z.ZodString;
        distanceMeters: z.ZodNumber;
        walkMinutes: z.ZodNumber;
    }, z.core.$strip>>;
    descriptionShort: z.ZodString;
    descriptionLong: z.ZodString;
    heroImageUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    galleryImageUrls: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    thumbnailUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    websiteUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    instagramUrl: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    phoneNumber: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    operatorName: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    business: z.ZodObject<{
        isAlwaysOpen: z.ZodBoolean;
        openingHoursText: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        regularHolidaysText: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        reservationRequired: z.ZodDefault<z.ZodBoolean>;
        lastEntryTime: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        estimatedStayMinutesMin: z.ZodNumber;
        estimatedStayMinutesMax: z.ZodNumber;
        weeklyHours: z.ZodOptional<z.ZodObject<{
            mon: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            tue: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            wed: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            thu: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            fri: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            sat: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
            sun: z.ZodOptional<z.ZodArray<z.ZodObject<{
                open: z.ZodString;
                close: z.ZodString;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        operationalJudgement: z.ZodOptional<z.ZodObject<{
            regularClosedDays: z.ZodArray<z.ZodEnum<{
                mon: "mon";
                tue: "tue";
                wed: "wed";
                thu: "thu";
                fri: "fri";
                sat: "sat";
                sun: "sun";
                holiday: "holiday";
            }>>;
            hasIrregularClosures: z.ZodDefault<z.ZodBoolean>;
            seasonalClosures: z.ZodDefault<z.ZodArray<z.ZodObject<{
                startDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                endDate: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                startMonth: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
                endMonth: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
                note: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            }, z.core.$strip>>>;
            lastAdmission: z.ZodObject<{
                type: z.ZodEnum<{
                    none: "none";
                    fixed_time: "fixed_time";
                    before_close: "before_close";
                }>;
                time: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                minutesBeforeClose: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
                note: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
            }, z.core.$strip>;
            flags: z.ZodObject<{
                hasRegularHolidayRule: z.ZodDefault<z.ZodBoolean>;
                hasSeasonalClosureRule: z.ZodDefault<z.ZodBoolean>;
                hasLastAdmissionRule: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>;
            needsManualReview: z.ZodDefault<z.ZodBoolean>;
            parserVersion: z.ZodNumber;
            researchMeta: z.ZodOptional<z.ZodObject<{
                confidence: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                notes: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
                primarySources: z.ZodArray<z.ZodString>;
                weeklyHoursRaw: z.ZodOptional<z.ZodObject<{
                    mon: z.ZodOptional<z.ZodString>;
                    tue: z.ZodOptional<z.ZodString>;
                    wed: z.ZodOptional<z.ZodString>;
                    thu: z.ZodOptional<z.ZodString>;
                    fri: z.ZodOptional<z.ZodString>;
                    sat: z.ZodOptional<z.ZodString>;
                    sun: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    pricing: z.ZodObject<{
        priceType: z.ZodEnum<{
            free: "free";
            unknown: "unknown";
            paid: "paid";
            purchase_optional: "purchase_optional";
        }>;
        priceLabel: z.ZodUnion<readonly [z.ZodString, z.ZodNull]>;
        priceMinYen: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
        priceMaxYen: z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>;
    }, z.core.$strip>;
    access: z.ZodObject<{
        supportedTransports: z.ZodArray<z.ZodEnum<{
            train: "train";
            car: "car";
            walk: "walk";
            rental_cycle: "rental_cycle";
            bus: "bus";
        }>>;
        parkingAvailable: z.ZodDefault<z.ZodBoolean>;
        bikeParkingAvailable: z.ZodDefault<z.ZodBoolean>;
        busStopNearby: z.ZodDefault<z.ZodBoolean>;
        requiresFirstStop: z.ZodDefault<z.ZodBoolean>;
        requiredFirstStopReason: z.ZodDefault<z.ZodUnion<readonly [z.ZodEnum<{
            rental_cycle_pickup: "rental_cycle_pickup";
            ticket_exchange: "ticket_exchange";
            checkin_required: "checkin_required";
            other: "other";
        }>, z.ZodNull]>>;
    }, z.core.$strip>;
    plannerAttributes: z.ZodObject<{
        themes: z.ZodArray<z.ZodString>;
        moodTags: z.ZodArray<z.ZodString>;
        weatherSuitability: z.ZodObject<{
            sunny: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
            cloudy: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
            rainy: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
            windy: z.ZodEnum<{
                good: "good";
                ok: "ok";
                bad: "bad";
            }>;
        }, z.core.$strip>;
        timeOfDaySuitability: z.ZodArray<z.ZodEnum<{
            morning: "morning";
            daytime: "daytime";
            sunset: "sunset";
            night: "night";
        }>>;
        visitPace: z.ZodArray<z.ZodEnum<{
            short_stop: "short_stop";
            normal_stop: "normal_stop";
            long_stay: "long_stay";
        }>>;
        withWho: z.ZodArray<z.ZodEnum<{
            solo: "solo";
            friends: "friends";
            couple: "couple";
            family: "family";
        }>>;
        physicalLoad: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
        indoorOutdoor: z.ZodEnum<{
            indoor: "indoor";
            outdoor: "outdoor";
            mixed: "mixed";
        }>;
        rainFallbackCandidate: z.ZodBoolean;
        photoSpotScore: z.ZodNumber;
        scenicScore: z.ZodNumber;
        foodScore: z.ZodNumber;
        shoppingScore: z.ZodNumber;
        experienceScore: z.ZodNumber;
        stationStopoverScore: z.ZodNumber;
        priorityScore: z.ZodNumber;
    }, z.core.$strip>;
    aiContext: z.ZodObject<{
        plannerSummary: z.ZodString;
        whyVisit: z.ZodArray<z.ZodString>;
        bestFor: z.ZodArray<z.ZodString>;
        avoidIf: z.ZodArray<z.ZodString>;
        sampleUseCases: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    relatedSpotIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    campaignCompatible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    couponCompatible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    storyCompatible: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    source: z.ZodEnum<{
        manual: "manual";
        import_csv: "import_csv";
        import_json: "import_json";
    }>;
    lastReviewedAt: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>>;
    id: z.ZodString;
    searchText: z.ZodString;
    createdAt: z.ZodUnknown;
    updatedAt: z.ZodUnknown;
}, z.core.$strict>;
export declare const spotListFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
        archived: "archived";
    }>>;
    primaryCategory: z.ZodOptional<z.ZodEnum<{
        see: "see";
        eat: "eat";
        shop: "shop";
        stay: "stay";
        experience: "experience";
    }>>;
    areaName: z.ZodOptional<z.ZodString>;
    stationAreaType: z.ZodOptional<z.ZodEnum<{
        none: "none";
        iwami_station_area: "iwami_station_area";
        higashihama_station_area: "higashihama_station_area";
        oiwa_station_area: "oiwa_station_area";
    }>>;
    supportedTransports: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        train: "train";
        car: "car";
        walk: "walk";
        rental_cycle: "rental_cycle";
        bus: "bus";
    }>>>;
    storyCompatible: z.ZodOptional<z.ZodBoolean>;
    couponCompatible: z.ZodOptional<z.ZodBoolean>;
    campaignCompatible: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const spotSearchFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
        archived: "archived";
    }>>;
    primaryCategory: z.ZodOptional<z.ZodEnum<{
        see: "see";
        eat: "eat";
        shop: "shop";
        stay: "stay";
        experience: "experience";
    }>>;
    areaName: z.ZodOptional<z.ZodString>;
    stationAreaType: z.ZodOptional<z.ZodEnum<{
        none: "none";
        iwami_station_area: "iwami_station_area";
        higashihama_station_area: "higashihama_station_area";
        oiwa_station_area: "oiwa_station_area";
    }>>;
    supportedTransports: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        train: "train";
        car: "car";
        walk: "walk";
        rental_cycle: "rental_cycle";
        bus: "bus";
    }>>>;
    storyCompatible: z.ZodOptional<z.ZodBoolean>;
    couponCompatible: z.ZodOptional<z.ZodBoolean>;
    campaignCompatible: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodOptional<z.ZodNumber>;
    query: z.ZodString;
}, z.core.$strict>;
export type SpotWriteInputSchema = z.infer<typeof spotWriteInputSchema>;
export type SpotRecordSchema = z.infer<typeof spotRecordSchema>;
export type SpotListFiltersSchema = z.infer<typeof spotListFiltersSchema>;
export type SpotSearchFiltersSchema = z.infer<typeof spotSearchFiltersSchema>;
