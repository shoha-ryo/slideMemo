// src/app/dashboard/page.tsx
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { ProjectGrid } from "./projectList/ProjectGrid";
import DashBoardHeader from "../header/DashBoardHeader";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashBoardHeader />
      <div className="max-w-4xl mx-auto p-8">
        <ProjectGrid />
      </div>
    </AuthGuard>
  );
}
