
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
import { useAuth } from "@/contexts/AuthContext";

interface Attorney {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  bar_number?: string;
  specialization?: string[];
  years_of_experience?: number;
  hourly_rate?: number;
  firm_name?: string;
  client_count?: number;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

const Attorneys = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { profile } = useAuth();

  const fetchAttorneys = async () => {
    if (!profile?.firm_id) return;

    try {
      setLoading(true);

      // Build query based on user role
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at,
          last_login,
          is_active,
          firm_id,
          attorneys (
            bar_number,
            specialization,
            years_of_experience,
            hourly_rate
          ),
          firms (
            name
          )
        `)
        .eq('role', 'attorney')
        .order('created_at', { ascending: false });

      // Filter by firm for firm admins
      if (profile.role === 'firm_admin') {
        query = query.eq('firm_id', profile.firm_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attorneys:', error);
        return;
      }

      // Transform the data to match the Attorney interface
      const transformedAttorneys: Attorney[] = (data || []).map(attorney => ({
        id: attorney.id,
        full_name: `${attorney.first_name || ''} ${attorney.last_name || ''}`.trim(),
        email: attorney.email,
        phone: attorney.phone,
        created_at: attorney.created_at,
        last_login: attorney.last_login,
        is_active: attorney.is_active,
        bar_number: attorney.attorneys?.bar_number,
        specialization: attorney.attorneys?.specialization,
        years_of_experience: attorney.attorneys?.years_of_experience,
        hourly_rate: attorney.attorneys?.hourly_rate,
        firm_name: attorney.firms?.name,
        client_count: 0 // Will be populated separately if needed
      }));

      setAttorneys(transformedAttorneys);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.firm_id) {
      fetchAttorneys();
    }
  }, [profile?.firm_id]);

  const filteredAttorneys = attorneys.filter(attorney =>
    attorney.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attorney.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (attorney.specialization && attorney.specialization.some(spec => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    ))
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
