
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Mail, Phone, Building, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientsStats } from "@/components/clients/ClientsStats";
import { AddClientDialog } from "@/components/clients/AddClientDialog";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  is_dropped: boolean;
  dropped_date?: string;
  assigned_attorney_id?: string;
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeClients = clients.filter(client => !client.is_dropped);
  const droppedClients = clients.filter(client => client.is_dropped);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients Dashboard</h1>
              <p className="text-gray-600">Manage your client relationships and track engagement</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>

          {/* Stats Cards */}
          <ClientsStats 
            totalClients={clients.length}
            activeClients={activeClients.length}
            droppedClients={droppedClients.length}
          />

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients by name, email, or company..."
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

          {/* Clients Table */}
          <ClientsTable 
            clients={filteredClients}
            loading={loading}
            onRefresh={fetchClients}
          />

          {/* Add Client Dialog */}
          <AddClientDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onClientAdded={fetchClients}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Clients;
