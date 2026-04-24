"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPlanGenerationPrompt = buildPlanGenerationPrompt;
const constants_1 = require("./constants");
const tripStyleLabel = {
    [constants_1.TRIP_STYLE.DAY_TRIP]: "日帰り",
    [constants_1.TRIP_STYLE.OVERNIGHT]: "宿泊",
};
const returnTransportLabel = {
    [constants_1.RETURN_TRANSPORT.TRAIN]: "電車",
    [constants_1.RETURN_TRANSPORT.CAR]: "車",
};
const localTransportLabel = {
    [constants_1.LOCAL_TRANSPORT.WALK]: "徒歩",
    [constants_1.LOCAL_TRANSPORT.RENTAL_CYCLE]: "レンタサイクル",
    [constants_1.LOCAL_TRANSPORT.CAR]: "車",
    [constants_1.LOCAL_TRANSPORT.BUS]: "バス",
};
function toOriginText(request) {
    if (request.origin.type === "station") {
        return `${request.origin.name} (${request.origin.id})`;
    }
    return `現在地 (lat: ${request.origin.lat}, lng: ${request.origin.lng})`;
}
function toLocalTransportText(values) {
    if (values.length === 0)
        return "指定なし";
    return values.map((value) => localTransportLabel[value]).join(" / ");
}
function toReturnConstraintText(constraint) {
    if (constraint.type === "free") {
        return "自由（帰着地点の固定なし）";
    }
    return `電車で帰着（${constants_1.RETURN_STATION_LABEL[constraint.stationId]} / ${constraint.stationId}）`;
}
function buildPlanGenerationPrompt(request) {
    const desiredSpotsText = request.desiredSpots.length > 0 ? request.desiredSpots.join(" / ") : "指定なし";
    const lodgingText = request.lodgingName ?? "指定なし";
    const promptText = request.tripPrompt || "指定なし";
    const departureAtText = request.departureAt ?? "指定なし";
    const cycleConstraintText = request.requiresCyclePickup
        ? `必要（貸出拠点ID: ${constants_1.IWAMI_TOURISM_ASSOCIATION_ID} を旅程の初手付近に含めること）`
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
//# sourceMappingURL=prompt.js.map