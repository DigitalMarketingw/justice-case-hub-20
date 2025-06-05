
import { Sidebar } from "@/components/layout/Sidebar";
import { BillingDashboard } from "@/components/billing/BillingDashboard";
import { SidebarProvider } from "@/components/ui/sidebar";

const Billing = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <BillingDashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Billing;
