// src/app/dashboard/page.tsx
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { ProjectGrid } from "./components/ProjectGrid";
import DashBoardHeader from "../header/DashBoardHeader";
import { AuthLoading } from "@/components/Auth/AuthLoading";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashBoardHeader></DashBoardHeader>
      <div className="max-w-4xl mx-auto p-8">
        <ProjectGrid></ProjectGrid>
      </div>
    </AuthGuard>
  );
}
