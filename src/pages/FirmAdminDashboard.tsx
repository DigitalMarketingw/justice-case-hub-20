
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FirmAdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attorneyCount, setAttorneyCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.firm_id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get firm details
        const { data: firmData, error: firmError } = await supabase
          .from('firms')
          .select('name')
          .eq('id', profile.firm_id)
          .single();
          
        if (firmError) throw firmError;
        if (firmData) setFirmName(firmData.name);
        
        // Count attorneys in the firm from profiles table
        const { count: attorneyCount, error: attorneyError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('firm_id', profile.firm_id)
          .eq('role', 'attorney');
          
        if (attorneyError) throw attorneyError;
        setAttorneyCount(attorneyCount || 0);
        
        // Count clients in the firm from profiles table
        const { count: clientCount, error: clientError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('firm_id', profile.firm_id)
          .eq('role', 'client');
          
        if (clientError) throw clientError;
        setClientCount(clientCount || 0);

        // Count cases in the firm
        const { count: caseCount, error: caseError } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('firm_id', profile.firm_id);
          
        if (caseError) throw caseError;
        setCaseCount(caseCount || 0);
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile, toast]);

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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : caseCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attorney Management
                </CardTitle>
                <CardDescription>Manage attorneys at your firm</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Create and manage attorney accounts at your firm.</p>
                <Button onClick={() => navigate('/attorneys')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Attorneys
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Management
                </CardTitle>
                <CardDescription>Manage clients and assign attorneys</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Add new clients and assign them to attorneys.</p>
                <Button onClick={() => navigate('/clients')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Clients
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Case Management
                </CardTitle>
                <CardDescription>Manage cases and track progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View and manage all cases within your firm.</p>
                <Button onClick={() => navigate('/cases')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Cases
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendar & Scheduling
                </CardTitle>
                <CardDescription>Manage appointments and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Schedule appointments and track important dates.</p>
                <Button onClick={() => navigate('/calendar')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FirmAdminDashboard;
