
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsStats } from "@/components/clients/ClientsStats";
import { DroppedClientsSection } from "@/components/clients/DroppedClientsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  full_name: string;
  is_dropped: boolean;
  company_name?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  dropped_date?: string;
  assigned_attorney_id?: string;
  assigned_attorney_name?: string;
  firm_id?: string;
  firm_name?: string;
  created_by_name?: string;
  last_login?: string;
  is_active: boolean;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const isFirmAdminOrCaseManager = profile?.role === 'firm_admin' || profile?.role === 'super_admin' || profile?.role === 'case_manager';

  useEffect(() => {
    if (profile?.firm_id) {
      fetchClients();
    }
  }, [profile?.firm_id]);

  const fetchClients = async () => {
    if (!profile?.firm_id) return;

    try {
      setLoading(true);
      
      // First fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, created_at, is_dropped, dropped_date, assigned_attorney_id, firm_id, is_active, last_login')
        .eq('role', 'client')
        .eq('firm_id', profile.firm_id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return;
      }

      // Get unique attorney IDs
      const attorneyIds = [...new Set(clientsData?.map(c => c.assigned_attorney_id).filter(Boolean) || [])];
      
      // Fetch attorney names separately
      let attorneysMap = new Map();
      if (attorneyIds.length > 0) {
        const { data: attorneys, error: attorneysError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', attorneyIds);

        if (attorneysError) {
          console.error('Error fetching attorneys:', attorneysError);
        } else {
          attorneysMap = new Map(attorneys?.map(a => [a.id, `${a.first_name} ${a.last_name}`]) || []);
        }
      }

      // Transform the data to match the Client interface
      const transformedClients: Client[] = (clientsData || []).map(client => ({
        ...client,
        full_name: `${client.first_name} ${client.last_name}`,
        company_name: undefined,
        address: undefined,
        notes: undefined,
        tags: undefined,
        assigned_attorney_name: attorneysMap.get(client.assigned_attorney_id) || undefined,
        firm_name: undefined,
        created_by_name: undefined,
        is_active: client.is_active
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats for ClientsStats component
  const totalClients = clients.length;
  const activeClients = clients.filter(client => !client.is_dropped).length;
  const droppedClients = clients.filter(client => client.is_dropped).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Clients</h1>
                <p className="text-gray-600">Manage your client relationships</p>
              </div>
              <AddClientDialog onClientAdded={fetchClients} />
            </div>

            <ClientsStats 
              totalClients={totalClients}
              activeClients={activeClients}
              droppedClients={droppedClients}
            />

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Clients</CardTitle>
                    <CardDescription>View and manage all your active clients</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ClientsTable clients={filteredClients} loading={loading} onRefresh={fetchClients} />
              </CardContent>
            </Card>

            {isFirmAdminOrCaseManager && (
              <DroppedClientsSection onClientReassigned={fetchClients} />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Clients;
