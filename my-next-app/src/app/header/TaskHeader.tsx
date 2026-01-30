"use client";

import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlowLogo } from "../../../public/FLOW";
import { useTaskStore } from "../task/store/taskStore/taskStore";
import { useShallow } from "zustand/shallow";
import Link from "next/link";
import { SyncStatusBadge } from "../task/components/SyncStatus/InitialSyncStatus";
import { UserMenu } from "./components/UserMenu";
import { SettingMenu } from "./components/SettingMenu";

export default function TaskHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { projectTitle, syncStatus } = useTaskStore(
    useShallow((state) => ({
      projectTitle: state.projectTitle,
      syncStatus: state.syncStatus,
    })),
  );

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Logo & Project Name */}
        <div className="flex items-center gap-10">
          <Link href={"/home"}>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <FlowLogo className={"h-8 w-8"}></FlowLogo>
              <span>FLOW</span>
            </div>
          </Link>
        </div>

        <div className="text-xl font-bold text-foreground/80">
          {projectTitle}
        </div>

        {/* 右側 */}
        <div className="flex items-center gap-3">
          <SyncStatusBadge
            status={syncStatus}
            key={syncStatus}
          ></SyncStatusBadge>
          {/* 検索 */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="検索..."
                  className="h-9 w-64 bg-muted/50"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">検索</span>
              </Button>
            )}
          </div>

          {/* 通知 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                <span className="sr-only">通知</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="font-semibold">通知</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                >
                  すべて既読
                </Button>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium">
                  新しいタスクが割り当てられました
                </div>
                <div className="text-sm text-muted-foreground">
                  「ランディングページのデザイン」が追加されました
                </div>
                <div className="text-xs text-muted-foreground">5分前</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium">プロジェクトが更新されました</div>
                <div className="text-sm text-muted-foreground">
                  田中さんが「Webアプリ開発」を更新しました
                </div>
                <div className="text-xs text-muted-foreground">1時間前</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 設定 */}
					<SettingMenu/>

          {/* ユーザーメニュー */}
          <UserMenu />

          {/* メニュー */}
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">メニュー</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
