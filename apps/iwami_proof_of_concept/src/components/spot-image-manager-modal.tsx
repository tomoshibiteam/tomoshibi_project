"use client";

import { useMemo, useState } from "react";
import { updateSpotImageUrls, uploadSpotImageFile } from "@/lib/spots-admin-api";
import type { SpotMapPin } from "@/lib/spots-api";

type SpotImageManagerModalProps = {
  open: boolean;
  onClose: () => void;
  spots: SpotMapPin[];
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

type SpotImageDraft = {
  thumbnailUrl: string;
  heroImageUrl: string;
};

function buildDefaultDraft(spot: SpotMapPin): SpotImageDraft {
  return {
    thumbnailUrl: spot.thumbnailUrl ?? "",
    heroImageUrl: spot.heroImageUrl ?? "",
  };
}

function resolvePreviewImageUrl(params: { spot: SpotMapPin | null; draft: SpotImageDraft | null }): string {
  const { spot, draft } = params;
  if (draft?.thumbnailUrl.trim()) return draft.thumbnailUrl.trim();
  if (draft?.heroImageUrl.trim()) return draft.heroImageUrl.trim();
  if (!spot) return EMPTY_IMAGE_PLACEHOLDER_DATA_URL;
  if (spot.thumbnailUrl) return spot.thumbnailUrl;
  if (spot.heroImageUrl) return spot.heroImageUrl;
  return EMPTY_IMAGE_PLACEHOLDER_DATA_URL;
}

export function SpotImageManagerModal({ open, onClose, spots }: SpotImageManagerModalProps) {
  const [selectedSpotId, setSelectedSpotId] = useState<string>("");
  const [draftsBySpotId, setDraftsBySpotId] = useState<Record<string, SpotImageDraft>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const effectiveSelectedSpotId = selectedSpotId || spots[0]?.id || "";
  const selectedSpot = useMemo(
    () => spots.find((spot) => spot.id === effectiveSelectedSpotId) ?? null,
    [effectiveSelectedSpotId, spots],
  );

  const selectedDraft = useMemo(() => {
    if (!selectedSpot) return null;
    return draftsBySpotId[selectedSpot.id] ?? buildDefaultDraft(selectedSpot);
  }, [draftsBySpotId, selectedSpot]);

  if (!open) return null;

  const handleSelectSpot = (nextSpotId: string) => {
    setSelectedSpotId(nextSpotId);
    setSaveError(null);
    setSaveMessage(null);
  };

  const handleEditSelectedSpotDraft = (patch: Partial<SpotImageDraft>) => {
    if (!selectedSpot) return;
    setDraftsBySpotId((prev) => {
      const current = prev[selectedSpot.id] ?? buildDefaultDraft(selectedSpot);
      return {
        ...prev,
        [selectedSpot.id]: {
          ...current,
          ...patch,
        },
      };
    });
    setSaveError(null);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!selectedSpot || !selectedDraft || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      await updateSpotImageUrls({
        spotId: selectedSpot.id,
        thumbnailUrl: selectedDraft.thumbnailUrl,
        heroImageUrl: selectedDraft.heroImageUrl,
      });
      setSaveMessage("画像URLを保存しました。");
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "画像URLの保存に失敗しました。";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadImage = async (params: { kind: "thumbnail" | "hero"; file: File | null }) => {
    const { kind, file } = params;
    if (!selectedSpot || !file) return;

    setSaveError(null);
    setSaveMessage(null);
    if (kind === "thumbnail") {
      setIsUploadingThumbnail(true);
    } else {
      setIsUploadingHero(true);
    }

    try {
      const uploadedUrl = await uploadSpotImageFile({
        spotId: selectedSpot.id,
        kind,
        file,
      });

      if (kind === "thumbnail") {
        handleEditSelectedSpotDraft({ thumbnailUrl: uploadedUrl });
      } else {
        handleEditSelectedSpotDraft({ heroImageUrl: uploadedUrl });
      }
      setSaveMessage("画像をアップロードしました。保存ボタンで反映を確定してください。");
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "画像のアップロードに失敗しました。";
      setSaveError(message);
    } finally {
      if (kind === "thumbnail") {
        setIsUploadingThumbnail(false);
      } else {
        setIsUploadingHero(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0f172a66] px-4 py-6 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="w-full max-w-[720px] overflow-hidden rounded-3xl border border-[#e5e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,250,251,0.95)_100%)] shadow-[0_28px_56px_rgba(15,23,42,0.22)]">
        <header className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <div>
            <h2 className="text-[1rem] font-semibold text-[#111827]">スポット画像管理</h2>
            <p className="mt-1 text-[0.75rem] text-[#6b7280]">
              運営向け設定です。未設定の場合はピンに「画像なし」プレースホルダーが表示されます。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.75rem] font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            閉じる
          </button>
        </header>

        <div className="grid gap-5 px-5 py-5 sm:grid-cols-[200px_1fr]">
          <div className="space-y-3">
            <label className="block text-[0.75rem] font-semibold text-[#374151]">対象スポット</label>
            <select
              value={effectiveSelectedSpotId}
              onChange={(event) => handleSelectSpot(event.target.value)}
              className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.8125rem] text-[#111827] outline-none ring-[#111827]/20 focus:ring"
            >
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.shortName}
                </option>
              ))}
            </select>

            <div className="overflow-hidden rounded-2xl border border-[#d1d5db] bg-[#f8fafc] p-3">
              <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.04em] text-[#6b7280]">プレビュー</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvePreviewImageUrl({ spot: selectedSpot, draft: selectedDraft })}
                alt={selectedSpot ? `${selectedSpot.shortName} preview` : "no image preview"}
                className="mx-auto h-28 w-28 rounded-full border border-[#e5e7eb] object-cover shadow-[0_8px_18px_rgba(17,24,39,0.12)]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[0.8125rem] font-semibold text-[#374151]">サムネイル画像URL</label>
              <input
                type="url"
                value={selectedDraft?.thumbnailUrl ?? ""}
                onChange={(event) => handleEditSelectedSpotDraft({ thumbnailUrl: event.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.875rem] text-[#111827] outline-none ring-[#111827]/20 focus:ring"
              />
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-[#374151] hover:bg-[#f9fafb]">
                  画像ファイルを選択
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!selectedSpot || isUploadingThumbnail || isUploadingHero}
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      void handleUploadImage({ kind: "thumbnail", file });
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {isUploadingThumbnail ? <span className="text-[0.6875rem] text-[#6b7280]">アップロード中...</span> : null}
              </div>
              <p className="mt-1 text-[0.6875rem] text-[#6b7280]">ピン表示はこちらを優先します。</p>
            </div>

            <div>
              <label className="mb-2 block text-[0.8125rem] font-semibold text-[#374151]">ヒーロー画像URL</label>
              <input
                type="url"
                value={selectedDraft?.heroImageUrl ?? ""}
                onChange={(event) => handleEditSelectedSpotDraft({ heroImageUrl: event.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 text-[0.875rem] text-[#111827] outline-none ring-[#111827]/20 focus:ring"
              />
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-[#374151] hover:bg-[#f9fafb]">
                  画像ファイルを選択
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!selectedSpot || isUploadingThumbnail || isUploadingHero}
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      void handleUploadImage({ kind: "hero", file });
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {isUploadingHero ? <span className="text-[0.6875rem] text-[#6b7280]">アップロード中...</span> : null}
              </div>
              <p className="mt-1 text-[0.6875rem] text-[#6b7280]">サムネイル未設定時の代替画像として使います。</p>
            </div>

            {saveError ? <p className="rounded-xl bg-[#fee4e2] px-3 py-2 text-[0.75rem] text-[#b42318]">{saveError}</p> : null}
            {saveMessage ? <p className="rounded-xl bg-[#e7f6ec] px-3 py-2 text-[0.75rem] text-[#0f6b36]">{saveMessage}</p> : null}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedSpot || !selectedDraft || isSaving}
                className={`rounded-xl px-4 py-2.5 text-[0.8125rem] font-semibold text-white transition-colors ${
                  !selectedSpot || !selectedDraft || isSaving
                    ? "cursor-not-allowed bg-[#9ca3af]"
                    : "bg-[#111827] hover:bg-[#1f2937]"
                }`}
              >
                {isSaving ? "保存中..." : "画像URLを保存"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
