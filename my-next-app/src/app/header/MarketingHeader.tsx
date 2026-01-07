"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // npx shadcn@latest add sheet で追加
import { FlowLogo } from "../../../public/FLOW";
import Link from "next/link";

export default function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={"/home"}>
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <FlowLogo className={"h-8 w-8"}></FlowLogo>
            <span>FLOW</span>
          </div>
        </Link>

        {/* デスクトップメニュー */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="#features"
            className="hover:text-primary transition-colors"
          >
            機能紹介
          </Link>
          <Link
            href="#pricing"
            className="hover:text-primary transition-colors"
          >
            料金プラン
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href="/login">
            <Button variant="ghost">ログイン</Button>
          </Link>
          <Link href="/register">
            <Button className="shadow-md hover:shadow-lg transition-all">
              今すぐ始める
            </Button>
          </Link>
        </nav>

        {/* モバイルメニュー (shadcn Sheet) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-10">
                <Link href="/login" className="text-lg font-medium">
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="text-lg font-medium text-primary"
                >
                  新規登録
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
