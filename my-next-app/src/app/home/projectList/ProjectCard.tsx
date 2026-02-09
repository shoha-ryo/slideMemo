"use client";

import type React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Folder } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProjectCardProps {
  project: { id: string; title: string };
  index: number;
  onDeleteClick: (project: { id: string; title: string }) => void;
  onEditClick: (project: { id: string; title: string }) => void;
}

export const ProjectCard = ({
  project,
  onEditClick,
  onDeleteClick,
}: ProjectCardProps) => {
  return (
    <div className="relative group">
      {/* カード全体のリンク */}
      <Link href={`/task/${project.id}`} className="block">
        <Card className="relative z-10 p-4 transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer">
          <div className="flex items-start justify-between gap-2">
            {/* 左側：プロジェクト情報 */}
            <div className="flex flex-1 items-start gap-3">
              <div className="flex-1">
                <div className="mb-2 rounded-md bg-muted w-fit p-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-medium leading-tight text-foreground">
                  {project.title}
                </h3>
              </div>
            </div>

            {/* 右側：メニュー（バブリングを防止してリンク発火を防ぐ） */}
            <div
              className="relative z-20"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
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
                      e.preventDefault();
                      onEditClick(project);
                    }}
                  >
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={() => {
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
