
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ReferralDashboardEnhanced } from "@/components/referrals/ReferralDashboardEnhanced";

const CaseReferrals = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <div className="p-6">
            <ReferralDashboardEnhanced />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CaseReferrals;
