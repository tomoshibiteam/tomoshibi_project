"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deleteSpotRecord, getSpotRecordById, updateSpotRecord, uploadSpotImageFile, type SpotAdminRecord } from "@/lib/spots-admin-api";

export type SpotAdminSidebarProps = {
  open: boolean;
  spotId: string | null;
  spotLabel?: string;
  draggedPosition?: { lat: number; lng: number } | null;
  onClose: () => void;
  onSaved?: (params: { spotId: string; spot: SpotAdminRecord }) => void;
  onDeleted?: (params: { spotId: string }) => void;
};

const EMPTY_IMAGE_PLACEHOLDER_DATA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#f5f7fa'/>
      <stop offset='100%' stop-color='#e5e7eb'/>
    </linearGradient>
  </defs>
  <rect width='240' height='240' fill='url(#bg)'/>
  <rect x='46' y='54' width='148' height='114' rx='16' fill='#ffffff' stroke='#cbd5e1' stroke-width='6'/>
  <circle cx='92' cy='94' r='14' fill='#9ca3af'/>
  <path d='M62 152l36-38 24 24 20-22 36 36' fill='none' stroke='#94a3b8' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/>
  <text x='120' y='203' text-anchor='middle' fill='#6b7280' font-size='24' font-family='sans-serif' font-weight='700'>NO IMAGE</text>
</svg>
`)}`;

const SHEET_DEFAULT_HEIGHT_RATIO = 0.56;
const SHEET_MIN_HEIGHT_PX = 320;
const SHEET_MAX_HEIGHT_RATIO = 0.92;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveSheetBounds(): { min: number; max: number; defaultHeight: number } {
  if (typeof window === "undefined") {
    return {
      min: SHEET_MIN_HEIGHT_PX,
      max: 680,
      defaultHeight: 480,
    };
  }
  const viewportHeight = window.innerHeight;
  const min = SHEET_MIN_HEIGHT_PX;
  const max = Math.max(min + 40, Math.floor(viewportHeight * SHEET_MAX_HEIGHT_RATIO));
  const defaultHeight = clampNumber(Math.round(viewportHeight * SHEET_DEFAULT_HEIGHT_RATIO), min, max);
  return { min, max, defaultHeight };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNonEmptyString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toNullableUrl(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toLocation(spot: SpotAdminRecord): { lat: number; lng: number } {
  const location = isObjectRecord(spot.location) ? spot.location : null;
  const lat = typeof location?.lat === "number" && Number.isFinite(location.lat) ? location.lat : 35.5755;
  const lng = typeof location?.lng === "number" && Number.isFinite(location.lng) ? location.lng : 134.3346;
  return { lat, lng };
}

function stripMetaForEditor(spot: SpotAdminRecord): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...spot };
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
}

function withLocationInJson(sourceJson: string, nextLat: number, nextLng: number): string {
  try {
    const parsed = JSON.parse(sourceJson) as unknown;
    if (!isObjectRecord(parsed)) return sourceJson;
    const currentLocation = isObjectRecord(parsed.location) ? parsed.location : {};
    const nextPayload: Record<string, unknown> = {
      ...parsed,
      location: {
        ...currentLocation,
        lat: nextLat,
        lng: nextLng,
      },
    };
    return JSON.stringify(nextPayload, null, 2);
  } catch {
    return sourceJson;
  }
}

export function SpotAdminSidebar({
  open,
  spotId,
  spotLabel,
  draggedPosition = null,
  onClose,
  onSaved,
  onDeleted,
}: SpotAdminSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [nameJa, setNameJa] = useState("");
  const [shortName, setShortName] = useState("");
  const [latText, setLatText] = useState("");
  const [lngText, setLngText] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [jsonPatchText, setJsonPatchText] = useState("{}");

  const [loadedSpot, setLoadedSpot] = useState<SpotAdminRecord | null>(null);
  const [sheetHeightPx, setSheetHeightPx] = useState<number | null>(null);
  const sheetRootRef = useRef<HTMLElement | null>(null);
  const sheetDragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!open || !spotId) return;

    let cancelled = false;
    const taskId = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setLoadError(null);
      setSaveError(null);
      setSaveMessage(null);

      void getSpotRecordById(spotId)
        .then((spot) => {
          if (cancelled) return;
          setLoadedSpot(spot);
          const location = toLocation(spot);
          setNameJa(toNonEmptyString(spot.nameJa));
          setShortName(toNonEmptyString(spot.shortName));
          setLatText(location.lat.toFixed(6));
          setLngText(location.lng.toFixed(6));
          setThumbnailUrl(toNonEmptyString(spot.thumbnailUrl));
          setHeroImageUrl(toNonEmptyString(spot.heroImageUrl));
          setJsonPatchText(JSON.stringify(stripMetaForEditor(spot), null, 2));
        })
        .catch((error) => {
          if (cancelled) return;
          const message =
            error instanceof Error && error.message.trim().length > 0
              ? error.message
              : "スポット情報の読み込みに失敗しました。";
          setLoadedSpot(null);
          setLoadError(message);
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(taskId);
    };
  }, [open, spotId]);

  useEffect(() => {
    if (!open) {
      if (sheetDragCleanupRef.current) {
        sheetDragCleanupRef.current();
        sheetDragCleanupRef.current = null;
      }
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      setSheetHeightPx((prev) => {
        const bounds = resolveSheetBounds();
        const current = prev ?? bounds.defaultHeight;
        return clampNumber(current, bounds.min, bounds.max);
      });
    });

    const handleResize = () => {
      setSheetHeightPx((prev) => {
        const bounds = resolveSheetBounds();
        const current = prev ?? bounds.defaultHeight;
        return clampNumber(current, bounds.min, bounds.max);
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      if (sheetDragCleanupRef.current) {
        sheetDragCleanupRef.current();
        sheetDragCleanupRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !draggedPosition) return;
    const rafId = window.requestAnimationFrame(() => {
      setLatText(draggedPosition.lat.toFixed(6));
      setLngText(draggedPosition.lng.toFixed(6));
      setJsonPatchText((prev) => withLocationInJson(prev, draggedPosition.lat, draggedPosition.lng));
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [draggedPosition, open]);

  const previewImageUrl = useMemo(() => {
    const thumb = thumbnailUrl.trim();
    if (thumb.length > 0) return thumb;
    const hero = heroImageUrl.trim();
    if (hero.length > 0) return hero;
    return EMPTY_IMAGE_PLACEHOLDER_DATA_URL;
  }, [heroImageUrl, thumbnailUrl]);

  const canSave = Boolean(spotId) && !loading && !saving;
  const canDelete = Boolean(spotId) && !loading && !saving && !deleting;

  const handleSheetHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.button !== 0) return;

    if (sheetDragCleanupRef.current) {
      sheetDragCleanupRef.current();
      sheetDragCleanupRef.current = null;
    }

    const root = sheetRootRef.current;
    const bounds = resolveSheetBounds();
    const startHeight = root?.offsetHeight ?? sheetHeightPx ?? bounds.defaultHeight;
    const startY = event.clientY;
    const pointerId = event.pointerId;

    event.preventDefault();

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY;
      const nextBounds = resolveSheetBounds();
      const nextHeight = clampNumber(startHeight - deltaY, nextBounds.min, nextBounds.max);
      setSheetHeightPx(nextHeight);
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };

    const onPointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      cleanup();
      sheetDragCleanupRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerEnd, { passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { passive: true });
    sheetDragCleanupRef.current = cleanup;
  };

  const handleUpload = async (params: { kind: "thumbnail" | "hero"; file: File | null }) => {
    const { kind, file } = params;
    if (!spotId || !file) return;

    setSaveError(null);
    setSaveMessage(null);
    if (kind === "thumbnail") {
      setUploadingThumbnail(true);
    } else {
      setUploadingHero(true);
    }

    try {
      const uploadedUrl = await uploadSpotImageFile({
        spotId,
        kind,
        file,
      });

      if (kind === "thumbnail") {
        setThumbnailUrl(uploadedUrl);
      } else {
        setHeroImageUrl(uploadedUrl);
      }
      setSaveMessage("画像をアップロードしました。保存で反映されます。");
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0 ? error.message : "画像アップロードに失敗しました。";
      setSaveError(message);
    } finally {
      if (kind === "thumbnail") {
        setUploadingThumbnail(false);
      } else {
        setUploadingHero(false);
      }
    }
  };

  const handleSave = async () => {
    if (!spotId || !canSave) return;

    const trimmedNameJa = nameJa.trim();
    const trimmedShortName = shortName.trim();
    const parsedLat = Number.parseFloat(latText);
    const parsedLng = Number.parseFloat(lngText);

    if (!trimmedNameJa || !trimmedShortName) {
      setSaveError("スポット名と表示名は必須です。");
      return;
    }
    if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      setSaveError("緯度の値が不正です。-90〜90 の範囲で入力してください。");
      return;
    }
    if (!Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      setSaveError("経度の値が不正です。-180〜180 の範囲で入力してください。");
      return;
    }

    let parsedPatch: Record<string, unknown>;
    try {
      const parsed = JSON.parse(jsonPatchText) as unknown;
      if (!isObjectRecord(parsed)) {
        setSaveError("JSON編集欄はオブジェクト形式で入力してください。");
        return;
      }
      parsedPatch = parsed;
    } catch {
      setSaveError("JSON編集欄の形式が不正です。");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const baseLocation =
        isObjectRecord(parsedPatch.location) ? parsedPatch.location : isObjectRecord(loadedSpot?.location) ? loadedSpot.location : {};

      const patch: Record<string, unknown> = {
        ...parsedPatch,
        nameJa: trimmedNameJa,
        shortName: trimmedShortName,
        thumbnailUrl: toNullableUrl(thumbnailUrl),
        heroImageUrl: toNullableUrl(heroImageUrl),
        location: {
          ...baseLocation,
          lat: parsedLat,
          lng: parsedLng,
        },
      };

      const updatedSpot = await updateSpotRecord({
        spotId,
        patch,
      });

      setLoadedSpot(updatedSpot);
      const nextLocation = toLocation(updatedSpot);
      setLatText(nextLocation.lat.toFixed(6));
      setLngText(nextLocation.lng.toFixed(6));
      setNameJa(toNonEmptyString(updatedSpot.nameJa));
      setShortName(toNonEmptyString(updatedSpot.shortName));
      setThumbnailUrl(toNonEmptyString(updatedSpot.thumbnailUrl));
      setHeroImageUrl(toNonEmptyString(updatedSpot.heroImageUrl));
      setJsonPatchText(JSON.stringify(stripMetaForEditor(updatedSpot), null, 2));
      onSaved?.({ spotId, spot: updatedSpot });
      setSaveMessage("スポット情報を保存しました。");
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "スポット情報の保存に失敗しました。";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!spotId || !canDelete) return;
    const confirmed = window.confirm("本当に消去しますか？\nこの操作は元に戻せません。");
    if (!confirmed) return;

    setDeleting(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      await deleteSpotRecord({ spotId });
      onDeleted?.({ spotId });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "スポット情報の消去に失敗しました。";
      setSaveError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (!spotId) return null;

  return (
    <aside
      ref={sheetRootRef}
      className={`fixed inset-x-0 bottom-0 z-[60] h-[56dvh] max-h-[92dvh] min-h-[320px] w-full overflow-hidden rounded-t-2xl border-t border-x border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_-14px_40px_rgba(15,23,42,0.2)] transition-transform duration-300 ease-out ${
        open ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"
      }`}
      style={sheetHeightPx != null ? { height: `${sheetHeightPx}px` } : undefined}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col">
          <header className="relative border-b border-[#e5e7eb] px-5 pt-2 pb-4">
            <div
              role="separator"
              aria-orientation="horizontal"
              onPointerDown={handleSheetHandlePointerDown}
              className="mx-auto mb-1 flex h-6 w-full max-w-[180px] cursor-ns-resize touch-none items-center justify-center"
            >
              <span className="h-1.5 w-11 rounded-full bg-[#d1d5db]" aria-hidden />
            </div>
            <div className="text-center">
              <h2 className="text-[1rem] font-semibold text-[#111827]">スポット編集（運営）</h2>
              <p className="mt-1 text-[0.75rem] text-[#6b7280]">{spotLabel ?? spotId}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-4 rounded-full border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.75rem] font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              閉じる
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-28">
            {loading ? <p className="text-sm text-[#6b7280]">スポット情報を読み込んでいます...</p> : null}
            {loadError ? <p className="rounded-xl bg-[#fee4e2] px-3 py-2 text-[0.75rem] text-[#b42318]">{loadError}</p> : null}

            {!loading && !loadError ? (
              <>
                <section className="grid grid-cols-1 gap-4 md:grid-cols-[144px_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-[#d1d5db] bg-[#f8fafc] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImageUrl}
                      alt="スポット画像プレビュー"
                      className="mx-auto h-28 w-28 rounded-full border border-[#e5e7eb] object-cover shadow-[0_8px_18px_rgba(17,24,39,0.12)]"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[0.75rem] font-semibold text-[#374151]">画像（サムネイル）</label>
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(event) => setThumbnailUrl(event.target.value)}
                        className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.8125rem] outline-none ring-[#111827]/20 focus:ring"
                        placeholder="https://..."
                      />
                      <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-[#374151] hover:bg-[#f9fafb]">
                        ファイルを選択
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingThumbnail || uploadingHero}
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            void handleUpload({ kind: "thumbnail", file });
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="mb-1 block text-[0.75rem] font-semibold text-[#374151]">画像（ヒーロー）</label>
                      <input
                        type="url"
                        value={heroImageUrl}
                        onChange={(event) => setHeroImageUrl(event.target.value)}
                        className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.8125rem] outline-none ring-[#111827]/20 focus:ring"
                        placeholder="https://..."
                      />
                      <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-[#374151] hover:bg-[#f9fafb]">
                        ファイルを選択
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingThumbnail || uploadingHero}
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            void handleUpload({ kind: "hero", file });
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[0.75rem] font-semibold text-[#374151]">スポット名（nameJa）</label>
                    <input
                      type="text"
                      value={nameJa}
                      onChange={(event) => setNameJa(event.target.value)}
                      className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.875rem] outline-none ring-[#111827]/20 focus:ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[0.75rem] font-semibold text-[#374151]">表示名（shortName）</label>
                    <input
                      type="text"
                      value={shortName}
                      onChange={(event) => setShortName(event.target.value)}
                      className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.875rem] outline-none ring-[#111827]/20 focus:ring"
                    />
                  </div>
                </section>

                <section>
                  <p className="mb-2 text-[0.75rem] font-semibold text-[#374151]">位置（ピンドラッグ連動）</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[0.6875rem] font-semibold text-[#6b7280]">緯度</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={latText}
                        onChange={(event) => setLatText(event.target.value)}
                        className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.8125rem] outline-none ring-[#111827]/20 focus:ring"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[0.6875rem] font-semibold text-[#6b7280]">経度</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={lngText}
                        onChange={(event) => setLngText(event.target.value)}
                        className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.8125rem] outline-none ring-[#111827]/20 focus:ring"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <label className="mb-1 block text-[0.75rem] font-semibold text-[#374151]">Firestore登録情報（JSON編集）</label>
                  <p className="mb-2 text-[0.6875rem] text-[#6b7280]">
                    このJSONを編集すると、登録済みフィールドをまとめて更新できます。基本項目（名前・座標・画像URL）は上記入力が優先されます。
                  </p>
                  <textarea
                    value={jsonPatchText}
                    onChange={(event) => setJsonPatchText(event.target.value)}
                    className="h-[280px] w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 font-mono text-[0.75rem] leading-5 outline-none ring-[#111827]/20 focus:ring"
                    spellCheck={false}
                  />
                </section>

                <section className="pt-2">
                  <p className="mb-2 text-[0.6875rem] text-[#6b7280]">このスポットをFirestoreから完全に消去します。</p>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canDelete}
                    className={`w-full rounded-xl px-4 py-3 text-[0.875rem] font-semibold transition-colors ${
                      canDelete
                        ? "border border-[#fca5a5] bg-[#fef2f2] text-[#b42318] hover:bg-[#fee2e2]"
                        : "cursor-not-allowed border border-[#f3d0d0] bg-[#fdf2f2] text-[#d7a4a4]"
                    }`}
                  >
                    {deleting ? "消去中..." : "消去"}
                  </button>
                </section>
              </>
            ) : null}
          </div>

          <footer className="sticky bottom-0 border-t border-[#e5e7eb] bg-white/95 px-5 py-4 backdrop-blur">
            {saveError ? <p className="mb-2 rounded-xl bg-[#fee4e2] px-3 py-2 text-[0.75rem] text-[#b42318]">{saveError}</p> : null}
            {saveMessage ? <p className="mb-2 rounded-xl bg-[#e7f6ec] px-3 py-2 text-[0.75rem] text-[#0f6b36]">{saveMessage}</p> : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || deleting}
              className={`w-full rounded-xl px-4 py-3 text-[0.875rem] font-semibold text-white transition-colors ${
                canSave && !deleting ? "bg-[#111827] hover:bg-[#1f2937]" : "cursor-not-allowed bg-[#9ca3af]"
              }`}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </footer>
        </div>
    </aside>
  );
}
