// src/app/task/page.tsx
import AppContent from "../AppContent";
import { AuthGuard } from "@/components/Auth/AuthGuard";

export default async function TaskPage({
  params, // [id]から取得
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  return (
    <AuthGuard>
      <AppContent key={projectId} projectId={projectId} />
    </AuthGuard>
  );
}
