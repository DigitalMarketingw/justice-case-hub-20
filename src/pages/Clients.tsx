
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsStats } from "@/components/clients/ClientsStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, created_at')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }

      // Transform the data to match the Client interface
      const transformedClients: Client[] = (data || []).map(client => ({
        ...client,
        full_name: `${client.first_name} ${client.last_name}`,
        is_dropped: false, // Default value since we don't have this field in profiles
        company_name: undefined,
        address: undefined,
        notes: undefined,
        tags: undefined,
        dropped_date: undefined,
        assigned_attorney_id: undefined
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
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>View and manage all your clients</CardDescription>
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Clients;
