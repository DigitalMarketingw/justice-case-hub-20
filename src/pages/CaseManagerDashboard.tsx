
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";

const CaseManagerDashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <EnhancedDashboard 
            title="Case Manager Dashboard"
            subtitle="Manage clients, cases, and documents across your firm"
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CaseManagerDashboard;
