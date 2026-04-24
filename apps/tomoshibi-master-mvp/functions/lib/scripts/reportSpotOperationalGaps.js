"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("../firebase-admin");
const spotService_1 = require("../spots/spotService");
async function main() {
    const db = (0, firebase_admin_1.getFirebaseAdminDb)();
    const spots = await (0, spotService_1.listSpots)({
        db,
        filters: {
            status: "published",
            limit: 200,
        },
    });
    const rows = spots.map((spot) => {
        const business = spot.business;
        const judgement = business.operationalJudgement;
        const hasStructuredHours = Boolean(business.weeklyHours && Object.keys(business.weeklyHours).length > 0);
        const hasLastAdmission = judgement?.lastAdmission.type !== "none";
        const hasSeasonalClosures = Boolean(judgement && judgement.seasonalClosures.length > 0);
        return {
            id: spot.id,
            nameJa: spot.nameJa,
            isAlwaysOpen: business.isAlwaysOpen,
            hasStructuredHours,
            regularClosedDays: judgement?.regularClosedDays ?? [],
            hasIrregularClosures: judgement?.hasIrregularClosures ?? false,
            hasSeasonalClosures,
            hasLastAdmission,
            needsManualReview: judgement?.needsManualReview ?? true,
        };
    });
    const manualRows = rows.filter((row) => row.needsManualReview);
    console.log(`[reportSpotOperationalGaps] total=${rows.length} manual=${manualRows.length}`);
    console.log(JSON.stringify(manualRows, null, 2));
}
main().catch((error) => {
    console.error("[reportSpotOperationalGaps] failed", error);
    process.exitCode = 1;
});
//# sourceMappingURL=reportSpotOperationalGaps.js.map