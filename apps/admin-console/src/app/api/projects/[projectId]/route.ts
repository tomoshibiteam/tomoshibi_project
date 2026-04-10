import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { getRequestAuthUser } from "@/lib/request-auth";

type DeleteRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: DeleteRouteContext,
) {
  const viewer = await getRequestAuthUser();
  if (!viewer) {
    return NextResponse.json(
      { error: "ログイン情報を確認できないため削除できません。再ログインしてください。" },
      { status: 401 },
    );
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin が未設定のため削除できません。" },
      { status: 503 },
    );
  }

  const { projectId } = await params;
  const normalizedProjectId = projectId.trim();
  if (!normalizedProjectId) {
    return NextResponse.json(
      { error: "削除対象のプロジェクトIDが不正です。" },
      { status: 400 },
    );
  }

  try {
    const projectRef = db.collection("projects").doc(normalizedProjectId);
    const snapshot = await projectRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません。" },
        { status: 404 },
      );
    }

    const data = snapshot.data() as { ownerUid?: unknown };
    const ownerUid = typeof data.ownerUid === "string" ? data.ownerUid.trim() : "";
    if (!ownerUid || ownerUid !== viewer.uid) {
      return NextResponse.json(
        { error: "このプロジェクトを削除する権限がありません。" },
        { status: 403 },
      );
    }

    await projectRef.delete();
    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "プロジェクト削除中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
