
import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentsDashboard } from "@/components/documents/DocumentsDashboard";
import { SidebarProvider } from "@/components/ui/sidebar";

const Documents = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <DocumentsDashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Documents;
