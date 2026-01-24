"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth, signOut } from "firebase/auth";
import { useUserStore } from "@/store/userStore";
import { LogOut, User } from "lucide-react";
import { ProfileEditDialog } from "./ProfileEditDialog";

export const UserMenu = () => {
  const auth = getAuth();
  const { user, isSynced } = useUserStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const onLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 px-2 outline-none hover:bg-accent"
          >
            <Avatar className="h-7 w-7 border">
              <AvatarImage
                src={auth.currentUser?.photoURL || ""}
                alt={user.name || ""}
              />
              <AvatarFallback
                className={`text-xs font-bold transition-colors ${
                  !isSynced
                    ? "bg-primary/50 animate-pulse text-transparent" // 同期中：グレーの点滅＋文字を隠す
                    : "bg-primary/10 text-primary" // 完了後：ブランドカラー＋文字表示
                }`}
              >
                {user.name ? user.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-0.5 leading-none">
              {user.name && <p className="font-medium text-sm">{user.name}</p>}
              {user.email && (
                <p className="w-[200px] truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setIsProfileOpen(true)}
          >
            <User className="mr-2 h-4 w-4" />
            <span>プロフィール編集</span>
          </DropdownMenuItem>

          {/* <DropdownMenuItem className="cursor-pointer">
						<Settings className="mr-2 h-4 w-4" />
						<span>プロジェクト設定</span>
					</DropdownMenuItem> */}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={onLogout}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileEditDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
};
