"use client"

import type React from "react"

import { useState } from "react"
import { Plus, MoreVertical, Folder, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Project = {
  id: string
  name: string
  tasksCount: number
  status: "planning" | "in-progress" | "completed"
}

const statusLabels = {
  planning: "計画中",
  "in-progress": "進行中",
  completed: "完了",
}

export function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Webアプリケーション開発", tasksCount: 12, status: "planning" },
    { id: "2", name: "モバイルアプリ設計", tasksCount: 8, status: "planning" },
    { id: "3", name: "ランディングページ制作", tasksCount: 15, status: "in-progress" },
    { id: "4", name: "ブランディング戦略", tasksCount: 20, status: "completed" },
    { id: "5", name: "UIデザインシステム", tasksCount: 18, status: "completed" },
  ])

  const [newProjectName, setNewProjectName] = useState("")
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [draggedProject, setDraggedProject] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAddProject = () => {
    const projectName = newProjectName.trim()
    if (!projectName) return

    setProjects((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: projectName,
        tasksCount: 0,
        status: "planning",
      },
    ])

    setNewProjectName("")
    setIsAddingProject(false)
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId))
  }

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedProject(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()

    if (draggedProject === null) return

    const draggedIndex = projects.findIndex((p) => p.id === draggedProject)
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedProject(null)
      setDragOverIndex(null)
      return
    }

    const newProjects = [...projects]
    const [removed] = newProjects.splice(draggedIndex, 1)
    newProjects.splice(targetIndex, 0, removed)

    setProjects(newProjects)
    setDraggedProject(null)
    setDragOverIndex(null)
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planning":
        return "bg-zinc-200 text-zinc-700"
      case "in-progress":
        return "bg-zinc-700 text-white"
      case "completed":
        return "bg-zinc-900 text-white"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">全プロジェクト</h2>
          <p className="text-sm text-muted-foreground">{projects.length} プロジェクト</p>
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
                  handleAddProject()
                } else if (e.key === "Escape") {
                  setIsAddingProject(false)
                  setNewProjectName("")
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
                  setIsAddingProject(false)
                  setNewProjectName("")
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {projects.map((project, index) => (
          <Card
            key={project.id}
            draggable
            onDragStart={(e) => handleDragStart(e, project.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`cursor-move p-4 transition-all hover:shadow-lg ${
              draggedProject === project.id ? "opacity-50" : ""
            } ${dragOverIndex === index ? "ring-2 ring-foreground" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-1 items-start gap-3">
                <div className="mt-1 cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-md bg-muted p-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-medium leading-tight text-foreground">{project.name}</h3>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                      {statusLabels[project.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.tasksCount} タスク</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">メニュー</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>編集</DropdownMenuItem>
                  <DropdownMenuItem>複製</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProject(project.id)}>
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
