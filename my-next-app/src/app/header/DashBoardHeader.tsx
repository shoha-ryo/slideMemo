"use client";

import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlowLogo } from "../../../public/FLOW";
import { useTaskStore } from "../task/store/taskStore/taskStore";
import { useShallow } from "zustand/shallow";
import Link from "next/link";
import { UserMenu } from "./components/UserMenu";
import { SyncStatusBadge } from "../task/components/SyncStatus/InitialSyncStatus";

export default function DashBoardHeader() {
  const { syncStatus } = useTaskStore(
    useShallow((state) => ({
			syncStatus: state.syncStatus,
    })),
  );

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        {/* 左側セクション */}
        <div className="flex items-center gap-10">
          <Link href={"/home"}>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <FlowLogo className={"h-8 w-8"}></FlowLogo>
              <span>FLOW</span>
            </div>
          </Link>
        </div>

        {/* 中央セクション */}
        <div className="flex items-center">
					<SyncStatusBadge
						status={syncStatus}
						key={syncStatus}
					></SyncStatusBadge>
          {/* 検索バー */}
          <div className="relative w-full max-w-lg group">
            {/* アイコン：absoluteでインプットの上に重ねる */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>

            <Input
              type="search"
              placeholder="タスクを検索..."
              className="h-9 w-full pl-10 bg-muted/50 border-transparent focus-visible:bg-background transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* 右側セクション */}
        <div className="flex items-center gap-3">
          {/* Notifications */}

          {/* Settings */}

          {/* User Profile */}
          <UserMenu />

          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">メニュー</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
