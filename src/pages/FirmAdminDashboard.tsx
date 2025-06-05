
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const FirmAdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [attorneyCount, setAttorneyCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.firm_id) return;
      
      setLoading(true);
      
      // Get firm details
      const { data: firmData, error: firmError } = await supabase
        .from('firms')
        .select('name')
        .eq('id', profile.firm_id)
        .single();
        
      if (firmError) {
        console.error('Error fetching firm:', firmError);
      } else if (firmData) {
        setFirmName(firmData.name);
      }
      
      // Count attorneys in the firm
      const { count: attorneyCount, error: attorneyError } = await supabase
        .from('attorneys')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', profile.firm_id);
        
      if (attorneyError) {
        console.error('Error fetching attorneys:', attorneyError);
      } else {
        setAttorneyCount(attorneyCount || 0);
      }
      
      // Count clients in the firm
      const { count: clientCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', profile.firm_id);
        
      if (clientError) {
        console.error('Error fetching clients:', clientError);
      } else {
        setClientCount(clientCount || 0);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Firm Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {profile?.first_name} {profile?.last_name}</p>
              {firmName && <p className="text-gray-600">Firm: {firmName}</p>}
            </div>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attorneys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : attorneyCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : clientCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attorney Management</CardTitle>
                <CardDescription>Manage attorneys at your firm</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create and manage attorney accounts at your firm.</p>
                <Button>Manage Attorneys</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Manage clients and assign attorneys</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Add new clients and assign them to attorneys.</p>
                <Button>Manage Clients</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FirmAdminDashboard;
