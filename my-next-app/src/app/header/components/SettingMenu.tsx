"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import { MemberManagement } from "./MemberManagement";
import { MemberRole } from "@prisma/client";

export const SettingMenu = () => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	useEffect(() => {
			if (!isDialogOpen) {
				const timer = setTimeout(() => {
					document.body.style.pointerEvents = "auto";
				}, 100); // ダイアログが消えるアニメーションを待ってから実行
				return () => clearTimeout(timer);
			}
		}, [isDialogOpen]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onSelect={(e) => {
              // デフォルトの動作（メニューを閉じる）を防がず、
              // かつダイアログをトリガーする
              setIsDialogOpen(true);
            }}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>チーム管理</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* チーム管理の実体（モーダル） */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>チーム管理</DialogTitle>
          </DialogHeader>
          <MemberManagement />
        </DialogContent>
      </Dialog>
    </>
  );
};
