import {
  IWAMI_TOURISM_ASSOCIATION_ID,
  LOCAL_TRANSPORT,
  RETURN_STATION_LABEL,
  RETURN_TRANSPORT,
  TRIP_STYLE,
} from "./constants";
import type { LocalTransport, NormalizedPlanRequest, ReturnConstraint, ReturnTransport, TripStyle } from "./types";

const tripStyleLabel: Record<TripStyle, string> = {
  [TRIP_STYLE.DAY_TRIP]: "日帰り",
  [TRIP_STYLE.OVERNIGHT]: "宿泊",
};

const returnTransportLabel: Record<ReturnTransport, string> = {
  [RETURN_TRANSPORT.TRAIN]: "電車",
  [RETURN_TRANSPORT.CAR]: "車",
};

const localTransportLabel: Record<LocalTransport, string> = {
  [LOCAL_TRANSPORT.WALK]: "徒歩",
  [LOCAL_TRANSPORT.RENTAL_CYCLE]: "レンタサイクル",
  [LOCAL_TRANSPORT.CAR]: "車",
  [LOCAL_TRANSPORT.BUS]: "バス",
};

function toOriginText(request: NormalizedPlanRequest): string {
  if (request.origin.type === "station") {
    return `${request.origin.name} (${request.origin.id})`;
  }
  return `現在地 (lat: ${request.origin.lat}, lng: ${request.origin.lng})`;
}

function toLocalTransportText(values: LocalTransport[]): string {
  if (values.length === 0) return "指定なし";
  return values.map((value) => localTransportLabel[value]).join(" / ");
}

function toReturnConstraintText(constraint: ReturnConstraint): string {
  if (constraint.type === "free") {
    return "自由（帰着地点の固定なし）";
  }
  return `電車で帰着（${RETURN_STATION_LABEL[constraint.stationId]} / ${constraint.stationId}）`;
}

export function buildPlanGenerationPrompt(request: NormalizedPlanRequest): string {
  const desiredSpotsText = request.desiredSpots.length > 0 ? request.desiredSpots.join(" / ") : "指定なし";
  const lodgingText = request.lodgingName ?? "指定なし";
  const promptText = request.tripPrompt || "指定なし";
  const departureAtText = request.departureAt ?? "指定なし";
  const cycleConstraintText = request.requiresCyclePickup
    ? `必要（貸出拠点ID: ${IWAMI_TOURISM_ASSOCIATION_ID} を旅程の初手付近に含めること）`
    : "不要";

  return [
    "あなたは岩美町の旅行プラン作成アシスタントです。",
    "以下の条件を厳密に守り、無理のない動線で観光プラン候補を作成してください。",
    "",
    `旅行スタイル: ${tripStyleLabel[request.tripStyle]}`,
    `出発地点: ${toOriginText(request)}`,
    `出発時刻: ${departureAtText}`,
    `滞在時間（分）: ${request.durationMinutes}`,
    `帰りの手段: ${returnTransportLabel[request.returnTransport]}`,
    `帰着条件: ${toReturnConstraintText(request.returnConstraint)}`,
    `宿泊先: ${lodgingText}`,
    `主な移動手段: ${toLocalTransportText(request.localTransports)}`,
    `行ってみたい場所: ${desiredSpotsText}`,
    `自由入力の希望: ${promptText}`,
    `レンタサイクル受取条件: ${cycleConstraintText}`,
    "",
    "出力時の注意:",
    "- 移動負荷が高すぎない順序にする",
    "- 滞在時間内で成立する行程にする",
    "- 条件を満たせない場合は不足条件を明示する",
  ].join("\n");
}
