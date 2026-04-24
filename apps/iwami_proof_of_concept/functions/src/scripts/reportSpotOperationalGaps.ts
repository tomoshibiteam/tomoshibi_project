import { getFirebaseAdminDb } from "../firebase-admin";
import { listSpots } from "../spots/spotService";

async function main() {
  const db = getFirebaseAdminDb();
  const spots = await listSpots({
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

