
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AttorneysTable } from "@/components/attorneys/AttorneysTable";
import { AttorneysStats } from "@/components/attorneys/AttorneysStats";
import { AddAttorneyDialog } from "@/components/attorneys/AddAttorneyDialog";

interface Attorney {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  years_of_experience?: number;
  office_location?: string;
  bio?: string;
  created_at: string;
  user_id?: string;
}

const Attorneys = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchAttorneys = async () => {
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attorneys:', error);
        return;
      }

      setAttorneys(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttorneys();
  }, []);

  const filteredAttorneys = attorneys.filter(attorney =>
    attorney.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attorney.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (attorney.specialization && attorney.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const avgExperience = attorneys.length > 0 
    ? Math.round(attorneys.reduce((sum, attorney) => sum + (attorney.years_of_experience || 0), 0) / attorneys.length)
    : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attorneys Dashboard</h1>
              <p className="text-gray-600">Manage your legal team and track expertise</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Attorney
            </Button>
          </div>

          {/* Stats Cards */}
          <AttorneysStats 
            totalAttorneys={attorneys.length}
            avgExperience={avgExperience}
          />

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search attorneys by name, email, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filter</Button>
                <Button variant="outline">Export</Button>
              </div>
            </CardContent>
          </Card>

          {/* Attorneys Table */}
          <AttorneysTable 
            attorneys={filteredAttorneys}
            loading={loading}
            onRefresh={fetchAttorneys}
          />

          {/* Add Attorney Dialog */}
          <AddAttorneyDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAttorneyAdded={fetchAttorneys}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Attorneys;
