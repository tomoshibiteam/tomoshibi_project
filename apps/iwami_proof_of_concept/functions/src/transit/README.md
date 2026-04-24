# Transit Reference Data

このディレクトリは `referenceData/transit` の保存形式と、JR seed / GTFS-JP import の実装を扱います。

## 目的

- GTFS-JP を一度取り込んで Firestore に正規化保存する
- 実行時は外部PDF/サイトではなく Firestore を source of truth として参照する
- `getNextTrips` などの repository から train/bus を同じ形式で取得できるようにする

## Firestore 構造

- `referenceData/transit/transportNodes/{nodeId}`
- `referenceData/transit/transitServices/{serviceId}`
- `referenceData/transit/transitCalendars/{calendarId}`
- `referenceData/transit/transitEdgeSchedules/{edgeScheduleId}`
- `referenceData/transit/busStopCandidates/{candidateId}`

## 取り込み対象

### 1) JR first-pass seed

- 3駅ノード（岩美駅・東浜駅・大岩駅）
- JR 隣接4区間の snapshot 時刻
- calendars: `weekday` / `weekend_holiday`

実行:

```bash
cd apps/iwami_proof_of_concept/functions
npm run seed:transit:emulator
```

### 2) GTFS-JP import（バス本体）

取り込み元:

- `stops.txt`
- `routes.txt`
- `trips.txt`
- `stop_times.txt`
- `calendar.txt`
- `calendar_dates.txt`（任意）

実行:

```bash
cd apps/iwami_proof_of_concept/functions
GTFS_INPUT_PATH=/absolute/path/to/gtfs.zip npm run import:transit:gtfs:emulator
# もしくは
npm run import:transit:gtfs:emulator -- --input /absolute/path/to/gtfs_dir_or_zip
```

## マッピング方針

- `stops.txt -> transportNodes`
  - `nodeType = bus_stop`
  - `location.lat/lng` は GTFS の `stop_lat/stop_lon`
  - `nodeId = gtfs_bus_stop_<stop_id>`（安定ID）
- `routes.txt + trips.txt -> transitServices`
  - `mode = bus`
  - `小田線` / `田後・陸上線` は serviceId を固定化
  - それ以外は `bus_gtfs_<route_id>`
- `stop_times.txt + trips.txt + calendar -> transitEdgeSchedules`
  - 隣接停留所に edge 分解
  - `serviceId + fromNodeId + toNodeId + calendarId` で集約
  - `trips` は `departMinutes` 昇順
- `calendar.txt + calendar_dates.txt -> transitCalendars`
  - `weekday` / `weekend_holiday` へ正規化
  - `metadata.gtfsServiceIds` に raw service を保持

## Overlay metadata

GTFS 生データは変えず、正規化後データに overlay を上乗せします。

- `routeVariant`
  - `oda`
  - `tago_terminating`
  - `tago_to_kugami`
  - `kugami_direct`
- `isShoppingTrip`
  - サンマート岩美店 + 道の駅きなんせ岩美を同一tripで通る便をフラグ
- 小田線予約注記
  - `reservationRuleType = partial_no_reservation`
  - `reservationRuleNote` を trip 単位で保持

## Idempotent運用

- upsert（`set(..., { merge: true })`）で重複投入しない
- 同一 GTFS の再importでも doc ID を固定して上書き
- すべての doc に `source` / `version` / `importedAt` を保存

## Repository 参照API

- `getNode(nodeId)`
- `listOriginReturnStations()`
- `getOutgoingSchedules(fromNodeId, mode, calendarId)`
- `getNextTrips(fromNodeId, toNodeId, mode, calendarId, afterMinutes, limit)`

## 現在のスコープ外

- GTFS-RT（遅延）
- 運賃計算
- train+bus混在の最適経路探索本実装
- 買い物便/variant の完全自動判定
