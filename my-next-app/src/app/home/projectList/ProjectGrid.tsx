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

export function ProjectGrid() {
  // 1. Firebaseのキャッシュから即座にUIDを取得（初期値）
  const [userId, setUserId] = useState(() => auth.currentUser?.uid || "");
  const [newProjectName, setNewProjectName] = useState("");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<any | null>(null);
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 2. DBの状態を常に監視。DBが変わればUIが自動で再描画される
  const projects =
    useLiveQuery(async () => {
      if (!userId) return [];
      return await db.projects.where("userId").equals(userId).toArray();
    }, [userId]) || [];

  // 3. 認証とサーバー同期
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // サーバーから最新を取得してIndexedDBを更新（バックグラウンド処理）
        const result = await getProjects(user.uid);
        if (result.success && result.data) {
          const projectsToSave = result.data.map((p: any) => ({
            ...p,
            createdAt:
              p.createdAt instanceof Date ? p.createdAt.getTime() : p.createdAt,
            updatedAt:
              p.updatedAt instanceof Date ? p.updatedAt.getTime() : p.updatedAt,
          }));
          await db.projects.bulkPut(projectsToSave);
        }
      } else {
        setUserId("");
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

    // UI更新は不要（Dexieが検知する）。DBに突っ込むだけ。
    await db.projects.add(newProject);

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
  };

  // 6. 削除
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    const { id } = projectToDelete;

    await db.projects.delete(id);
    setProjectToDelete(null);

    await deleteProject(id);
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (draggedProject === null) return;

    const draggedIndex = projects.findIndex((p) => p.id === draggedProject);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedProject(null);
      setDragOverIndex(null);
      return;
    }

    const newProjects = [...projects];
    const [removed] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, removed);

    // setProjects(newProjects);
    setDraggedProject(null);
    setDragOverIndex(null);
  };

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

      {/* Add Project Form */}
      {isAddingProject && (
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="プロジェクト名を入力..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
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

      {/* Projects Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            draggedProject={draggedProject}
            dragOverIndex={dragOverIndex}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragEnd={handleDragEnd}
            handleDrop={handleDrop}
            onDeleteClick={(p) => setProjectToDelete(p)}
            onEditClick={(p) => setProjectToEdit(p)}
          />
        ))}
      </div>

      <EditProjectDialog
        open={!!projectToEdit}
        onOpenChange={(open) => !open && setProjectToEdit(null)}
        onConfirm={handleUpdateTitle}
        initialTitle={projectToEdit?.title || ""}
      />
      <DeleteProjectDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        projectTitle={projectToDelete?.title || ""}
      />
    </div>
  );
}
