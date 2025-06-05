
import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { FirmsStats } from "@/components/firms/FirmsStats";
import { FirmsTable } from "@/components/firms/FirmsTable";
import { AddFirmDialog } from "@/components/firms/AddFirmDialog";
import { AddFirmAdminDialog } from "@/components/firms/AddFirmAdminDialog";

function Firms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddFirmDialogOpen, setIsAddFirmDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Firms Management</h1>
              <p className="text-gray-600">Manage law firms and create firm administrator accounts</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddAdminDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Firm Admin
              </Button>
              <Button onClick={() => setIsAddFirmDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Firm
              </Button>
            </div>
          </div>

          <FirmsStats />

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search firms by name, code, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <FirmsTable searchTerm={searchTerm} />
          </div>

          <AddFirmDialog 
            open={isAddFirmDialogOpen} 
            onOpenChange={setIsAddFirmDialogOpen}
          />
          
          <AddFirmAdminDialog 
            open={isAddAdminDialogOpen} 
            onOpenChange={setIsAddAdminDialogOpen}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default Firms;
