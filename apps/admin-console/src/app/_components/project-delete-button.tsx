"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "./material-icon";

type ProjectDeleteButtonProps = {
  projectId: string;
  projectName: string;
};

export function ProjectDeleteButton({
  projectId,
  projectName,
}: ProjectDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `「${projectName}」を削除します。よろしいですか？\nこの操作は元に戻せません。`,
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "プロジェクトの削除に失敗しました。");
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "プロジェクトの削除に失敗しました。";
      window.alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      aria-label={`${projectName} を削除`}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isDeleting}
      onClick={handleDelete}
      title="削除"
      type="button"
    >
      <MaterialIcon className="text-sm" name="delete" />
    </button>
  );
}
