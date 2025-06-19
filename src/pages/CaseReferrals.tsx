
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { CaseReferralDashboard } from "@/components/referrals/CaseReferralDashboard";

const CaseReferrals = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <div className="p-6">
            <CaseReferralDashboard />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CaseReferrals;
