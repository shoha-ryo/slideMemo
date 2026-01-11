import { Loader } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
}

export const AuthLoading = ({ message = "認証情報を確認しています..." }: AuthLoadingProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background gap-y-4">
      {/* スピナー部分 */}
      <div className="relative flex items-center justify-center">
        {/* 外側の装飾的なリング（オプション） */}
        <div className="absolute h-12 w-12 rounded-full border-4 border-muted/30" />
        {/* 回転するスピナー */}
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>

      {/* テキスト部分 */}
      <div className="flex flex-col items-center gap-y-1">
        <h3 className="text-lg font-semibold text-foreground">読み込み中</h3>
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
		
  );
};