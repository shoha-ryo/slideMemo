// src/components/Header/ProfileEditDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { updateUserNameAction } from "@/app/actions/user";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // 通知ライブラリ（任意）

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ open, onOpenChange }: Props) {
  const { user, setUser } = useUserStore();
  const [name, setName] = useState(user?.name || "");
  const [isPending, setIsPending] = useState(false);

  // ダイアログが閉じられた時、強制的に body の pointer-events を復元する
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100); // ダイアログが消えるアニメーションを待ってから実行
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setIsPending(true);
    const result = await updateUserNameAction(user.id, name);

    if (result.success && result.user) {
      // Zustandの情報を更新（これでヘッダー等も即座に変わる）
      setUser({
        ...user,
        name: result.user.name,
      });
      toast.success("プロフィールを更新しました");
      onOpenChange(false);
    } else {
      toast.error("更新に失敗しました");
    }
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>プロフィールの編集</DialogTitle>
            <DialogDescription>
              表示名などのアカウント情報を変更できます。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="あなたの名前"
              />
            </div>
            <div className="grid gap-2">
              <Label className="opacity-50">メールアドレス（変更不可）</Label>
              <Input value={user?.email} disabled className="bg-muted" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "保存中..." : "変更を保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
