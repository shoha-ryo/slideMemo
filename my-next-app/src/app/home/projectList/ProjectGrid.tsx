"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../../dexie/dexie";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// PrismaのAction類
import {
  createProject,
  updateProjectTitle,
  deleteProject,
  getProjects,
} from "@/app/home/projectList/action/forPrisma/projectActions";

// UI Components
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ProjectCard } from "./ProjectCard";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { useTaskStore } from "@/app/task/store/taskStore/taskStore";
import { showToast } from "@/components/ui/CustomToaster";

type ProjectTo = {
  id: string;
  title: string;
} | null;

export function ProjectGrid() {
  const [userId, setUserId] = useState(() => auth.currentUser?.uid || "");
  const [newProjectName, setNewProjectName] = useState("");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectTo>(null);
  const [projectToEdit, setProjectToEdit] = useState<ProjectTo>(null);
  const syncStatus = useTaskStore((state) => state.syncStatus);

  // 2. 最新順（createdAtの降順）にソートして監視
  const projects =
    useLiveQuery(async () => {
      if (!userId) return [];

      // 1. 自分がメンバー登録されているレコードをすべて取得
      const myMemberships = await db.projectMembers
        .where("userId")
        .equals(userId)
        .toArray();
      if (myMemberships.length === 0) return [];
      // 2. 取得した projectId の配列を作る
      const projectIds = myMemberships.map((m) => m.projectId);
      // 3. projects テーブルから、該当するプロジェクト本体をまとめて取得
      const projectEntities = await db.projects.bulkGet(projectIds);
      // 4. プロジェクト情報に自分のメンバー情報を付与して整形
      const combinedProjects = myMemberships
        .map((membership) => {
          const project = projectEntities.find(
            (p) => p?.id === membership.projectId,
          );
          if (!project) return null;
          return {
            ...project,
            myRole: membership.role,
            myStatus: membership.status,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null) // 削除済み等のゴミデータ除外
        .sort((a, b) => b.createdAt - a.createdAt); // 最新順にソート
      return combinedProjects;
    }, [userId]) || [];

  // 3. firebase認証＆prisma取得→Dexie保存
  useEffect(() => {
    useTaskStore.setState({ syncStatus: "syncing" });
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // リクエストが古いかどうか非同期の後でチェックする
        const requestToken = crypto.randomUUID();
        useTaskStore.setState({ initializeToken: requestToken });
        const result = await getProjects(user.uid);
        if (requestToken !== useTaskStore.getState().initializeToken) return; // リクエストが古ければ実行しない
        if (result.success && result.data) {
          // 1. プロジェクト本体だけを抽出してお掃除 (myRoleなどを除外)
          const projectsToSave = result.data.map(
            ({ myRole, myStatus, ...p }) => ({
              ...p,
              createdAt:
                p.createdAt instanceof Date
                  ? p.createdAt.getTime()
                  : p.createdAt,
              updatedAt:
                p.updatedAt instanceof Date
                  ? p.updatedAt.getTime()
                  : p.updatedAt,
            }),
          );
          // 2. メンバーシップ情報を抽出
          const membersToSave = result.data.map((p) => ({
            id: `${p.id}_${user.uid}`, // 複合キー的なID
            projectId: p.id,
            userId: user.uid,
            role: p.myRole,
            status: p.myStatus,
          }));
          try {
            // トランザクションで両方のテーブルに保存
            await db.transaction(
              "rw",
              [db.projects, db.projectMembers],
              async () => {
                await db.projects.bulkPut(projectsToSave);
                await db.projectMembers.bulkPut(membersToSave);
              },
            );
            useTaskStore.setState({ syncStatus: "synced" });
          } catch (err) {
            console.error("Dexie Save Error:", err);
            useTaskStore.setState({ syncStatus: "failed" });
          }
        }
      } else {
        setUserId("");
        useTaskStore.setState({ syncStatus: "failed" });
      }
    });
    return () => unsubscribe();
  }, []);

  // 4. 追加：まずDBに書き込む。UIは自動で付いてくる
  const handleAddProject = async () => {
    const title = newProjectName.trim();
    if (!title || !userId) return;

    const newProjectId = `project-${crypto.randomUUID()}`;
    const newProject = {
      id: newProjectId, // クライアント側でIDを確定
      title,
      userId,
      boardOrder: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newMembership = {
      id: `${newProjectId}_${userId}`,
      projectId: newProjectId,
      userId: userId,
      role: "OWNER" as const,
      status: "ACTIVE" as const,
    };

    // トランザクションで一気に保存
    await db.transaction("rw", [db.projects, db.projectMembers], async () => {
      await db.projects.add(newProject);
      await db.projectMembers.add(newMembership);
    });

    // 裏でサーバーに送信
    createProject(title, userId, newProjectId);
    setNewProjectName("");
    setIsAddingProject(false);
  };

  // 5. 更新：DBを直接update
  const handleUpdateTitle = async (newTitle: string) => {
    if (!projectToEdit) return;
    const { id } = projectToEdit;

    // DBを更新。即座に画面に反映される。
    await db.projects.update(id, {
      title: newTitle,
      updatedAt: Date.now(),
    });
    setProjectToEdit(null);

    // 裏でサーバー送信
    await updateProjectTitle(id, userId, newTitle);
    showToast("success", "正常に更新されました");
  };

  // 6. 削除
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    const { id } = projectToDelete;

    await db.projects.delete(id);
    setProjectToDelete(null);

    //todo: トーストを表示
    await deleteProject(id, userId);
    showToast("success", "正常に削除されました");
  };

  const SkeletonCard = () => (
    <div className="h-24 w-full rounded-xl border border-muted bg-card p-4 shadow-sm">
      <div className="animate-pulse space-y-4">
        {/* タイトル部分の横棒 */}
        <div className="h-4 w-3/4 rounded-full bg-muted-foreground/20" />
        {/* 詳細部分の横棒 */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-muted/60" />
          <div className="h-3 w-5/6 rounded-full bg-muted/60" />
        </div>
        {/* 下部のメタデータ用（オプション） */}
        {/* <div className="flex justify-between pt-2">
					<div className="h-2 w-16 rounded-full bg-muted/40" />
					<div className="h-2 w-12 rounded-full bg-muted/40" />
				</div> */}
      </div>
    </div>
  );
  // ロード中（synced以外）かつ データが0件の場合にスケルトンを表示
  const isLoading = syncStatus !== "synced" && projects.length === 0;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            全プロジェクト
          </h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} プロジェクト
          </p>
        </div>
        <Button onClick={() => setIsAddingProject(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          新規プロジェクト
        </Button>
      </div>

      {/* プロジェクト追加 */}
      {isAddingProject && (
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="プロジェクト名を入力..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;

                if (e.key === "Enter") {
                  handleAddProject();
                } else if (e.key === "Escape") {
                  setIsAddingProject(false);
                  setNewProjectName("");
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddProject}>
                作成
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingProject(false);
                  setNewProjectName("");
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* プロジェクト一覧 */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {isLoading ? (
          // ロード中はスケルトンを表示
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : projects.length > 0 ? (
          // データがある場合
          projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onDeleteClick={(p) => setProjectToDelete(p)}
              onEditClick={(p) => setProjectToEdit(p)}
            />
          ))
        ) : (
          // 同期完了後でも0件の場合
          <div className="col-span-full py-20 text-center text-muted-foreground">
            プロジェクトがありません。新しいプロジェクトを作成しましょう。
          </div>
        )}
      </div>

      <EditProjectDialog
        key={projectToEdit?.id}
        open={!!projectToEdit}
        onOpenChange={(open) => !open && setProjectToEdit(null)}
        onConfirm={handleUpdateTitle}
        initialTitle={projectToEdit?.title || ""}
      />
      <DeleteProjectDialog
        key={projectToDelete?.id}
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        projectTitle={projectToDelete?.title || ""}
      />
    </div>
  );
}
