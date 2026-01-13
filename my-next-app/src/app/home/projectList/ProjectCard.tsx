"use client";

import type React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Folder, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProjectCardProps {
  project: { id: string; title: string };
  index: number;
  draggedProject: string | null;
  dragOverIndex: number | null;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  onDeleteClick: (project: { id: string; title: string }) => void; // 修正：ダイアログを開くための関数
  onEditClick: (project: { id: string; title: string }) => void; // 修正：ダイアログを開くための関数
}

export const ProjectCard = ({
  project,
  index,
  draggedProject,
  dragOverIndex,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
	onEditClick,
  onDeleteClick,
}: ProjectCardProps) => {
  return (
    <div className="relative group">
      {/* カード全体のリンク（z-0） */}
      <Link
        href={`/task/${project.id}`}
        className="block group"
      >
				<Card
					draggable
					onDragStart={(e) => handleDragStart(e, project.id)}
					onDragOver={(e) => handleDragOver(e, index)}
					onDragEnd={handleDragEnd}
					onDrop={(e) => handleDrop(e, index)}
					className={`relative z-10 cursor-move p-4 transition-all hover:shadow-lg ${
						draggedProject === project.id ? "opacity-50" : ""
					} ${dragOverIndex === index ? "ring-2 ring-primary" : ""}`}
				>
					<div className="flex items-start justify-between gap-2">
						{/* 左側：ドラッグハンドルと情報 */}
						<div className="flex flex-1 items-start gap-3">
							<div className="mt-1 text-muted-foreground/50 group-hover:text-muted-foreground">
								<GripVertical className="h-5 w-5" />
							</div>
							<div className="flex-1">
								<div className="mb-2 rounded-md bg-muted w-fit p-2">
									<Folder className="h-4 w-4 text-muted-foreground" />
								</div>
								<h3 className="font-medium leading-tight text-foreground">
									{project.title}
								</h3>
							</div>
						</div>

						{/* 右側：メニュー（リンクを邪魔しないよう z-20） */}
						<div
							className="relative z-20"
							onClick={(e) => {
								e.stopPropagation()
								e.preventDefault()
							}}
						>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreVertical className="h-4 w-4" />
										<span className="sr-only">メニュー</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onSelect={(e) => {
											e.preventDefault()
											onEditClick(project);
										}}
									>
										編集
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-destructive"
										onSelect={(e) => {
											onDeleteClick(project);
										}}
									>
										削除
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</Card>
			</Link>
    </div>
  );
};