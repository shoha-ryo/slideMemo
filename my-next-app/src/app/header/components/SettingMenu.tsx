"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import { MemberManagement } from "./MemberManagement";
import { MemberRole } from "@prisma/client";

export const SettingMenu = () => {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
            <span className="sr-only">設定</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem>プロジェクト設定</DropdownMenuItem>
          
          {/* DialogTriggerをDropdownMenuItemとして扱うためのasChild */}
          <DialogTrigger asChild>
            <DropdownMenuItem className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              <span>チーム管理</span>
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuSeparator />
          <DropdownMenuItem>環境設定</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* チーム管理の実体（モーダル） */}
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>チーム管理</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <MemberManagement/>
        </div>
      </DialogContent>
    </Dialog>
  );
};