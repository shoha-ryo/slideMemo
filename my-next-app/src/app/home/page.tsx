// src/app/dashboard/page.tsx
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { ProjectGrid } from "./projectList/ProjectGrid";
import TaskHeader from "../header/TaskHeader";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <TaskHeader></TaskHeader>
      <div className="max-w-4xl mx-auto p-8">
        <ProjectGrid></ProjectGrid>
      </div>
    </AuthGuard>
  );
}
