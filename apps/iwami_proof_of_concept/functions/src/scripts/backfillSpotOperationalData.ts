import { getFirebaseAdminDb } from "../firebase-admin";
import { deriveBusinessOperationalData } from "../spots/businessRules";
import { listSpots, updateSpot } from "../spots/spotService";

async function main() {
  const db = getFirebaseAdminDb();
  const spots = await listSpots({
    db,
    filters: {
      limit: 200,
      status: "published",
    },
  });

  let updatedCount = 0;
  for (const [index, spot] of spots.entries()) {
    const derived = deriveBusinessOperationalData({
      isAlwaysOpen: spot.business.isAlwaysOpen,
      openingHoursText: spot.business.openingHoursText,
      regularHolidaysText: spot.business.regularHolidaysText,
      lastEntryTime: spot.business.lastEntryTime,
      weeklyHours: spot.business.weeklyHours,
      operationalJudgement: spot.business.operationalJudgement,
    });

    await updateSpot({
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
