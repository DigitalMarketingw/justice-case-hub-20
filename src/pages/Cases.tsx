
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CasesStats } from "@/components/cases/CasesStats";
import { CasesTable } from "@/components/cases/CasesTable";
import { AddCaseDialog } from "@/components/cases/AddCaseDialog";

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Cases Management</h1>
              <p className="text-gray-600">Manage all legal cases and track their progress</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Case
            </Button>
          </div>

          <CasesStats />

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cases by title, case number, client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <CasesTable searchTerm={searchTerm} />
          </div>

          <AddCaseDialog 
            open={isAddDialogOpen} 
            onOpenChange={setIsAddDialogOpen}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Cases;
