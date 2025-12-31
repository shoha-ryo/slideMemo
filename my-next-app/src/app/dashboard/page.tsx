// src/app/dashboard/page.tsx
import { AuthGuard } from "@/components/Auth/AuthGuard";
import CreateProjectForm from "./components/CreateProjectForm";
import ProjectList from "./components/ProjectList"; // 作成済みのリストを表示するコンポーネント（後述）

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">マイダッシュボード</h1>

        {/* プロジェクト作成フォーム */}
        <section className="mb-12">
          <CreateProjectForm />
        </section>

        {/* ここにプロジェクト一覧を出すと便利です */}
        <section>
          <h2 className="text-xl font-semibold mb-4">あなたのプロジェクト一覧</h2>
					<ProjectList></ProjectList>
        </section>
      </div>
    </AuthGuard>
  );
}