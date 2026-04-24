"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("../firebase-admin");
const businessRules_1 = require("../spots/businessRules");
const spotService_1 = require("../spots/spotService");
async function main() {
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    const spots = await (0, spotService_1.listSpots)({
        db,
        filters: {
            limit: 200,
            status: "published",
        },
    });
    let updatedCount = 0;
    for (const [index, spot] of spots.entries()) {
        const derived = (0, businessRules_1.deriveBusinessOperationalData)({
            isAlwaysOpen: spot.business.isAlwaysOpen,
            openingHoursText: spot.business.openingHoursText,
            regularHolidaysText: spot.business.regularHolidaysText,
            lastEntryTime: spot.business.lastEntryTime,
            weeklyHours: spot.business.weeklyHours,
            operationalJudgement: spot.business.operationalJudgement,
        });
        await (0, spotService_1.updateSpot)({
            db,
            spotId: spot.id,
            patch: {
                business: {
                    ...(derived.weeklyHours ? { weeklyHours: derived.weeklyHours } : {}),
                    lastEntryTime: derived.lastEntryTime,
                    operationalJudgement: derived.operationalJudgement,
                },
            },
        });
        updatedCount += 1;
        console.log(`[backfillSpotOperationalData] updated ${spot.id} (${index + 1}/${spots.length})`);
    }
    console.log(`[backfillSpotOperationalData] completed total=${spots.length} updated=${updatedCount}`);
}
main().catch((error) => {
    console.error("[backfillSpotOperationalData] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=backfillSpotOperationalData.js.map