
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Users, Settings, Building, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SuperAdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firmCount, setFirmCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Count firms
        const { count: firmCount, error: firmError } = await supabase
          .from('firms')
          .select('*', { count: 'exact', head: true });

        if (firmError) throw firmError;
        setFirmCount(firmCount || 0);

        // Count users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (userError) throw userError;
        setUserCount(userCount || 0);

        // Count cases
        const { count: caseCount, error: caseError } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true });

        if (caseError) throw caseError;
        setCaseCount(caseCount || 0);

        // Count clients
        const { count: clientCount, error: clientError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client');

        if (clientError) throw clientError;
        setClientCount(clientCount || 0);
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        setError(error.message || 'Failed to load dashboard statistics');
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const handleNavigateToFirms = () => {
    navigate('/firms');
  };

  const handleNavigateToCases = () => {
    navigate('/cases');
  };

  const handleNavigateToUsers = () => {
    navigate('/attorneys');
  };

  const handleNavigateToClients = () => {
    navigate('/clients');
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {profile?.first_name} {profile?.last_name}</p>
              {error && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  {error}
                </div>
              )}
            </div>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Firms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : firmCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : userCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : clientCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
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
                  <Building className="h-5 w-5" />
                  Firm Management
                </CardTitle>
                <CardDescription>Create and manage law firms</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create new firms and assign firm administrators.</p>
                <Button onClick={handleNavigateToFirms}>Manage Firms</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Client Management
                </CardTitle>
                <CardDescription>View and transfer clients between firms</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Monitor clients across all firms and transfer them when needed.</p>
                <Button onClick={handleNavigateToClients}>Manage Clients</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Cases Management
                </CardTitle>
                <CardDescription>View and manage all cases</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Monitor and oversee all legal cases across firms.</p>
                <Button onClick={handleNavigateToCases}>View Cases</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage attorneys and users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View and manage attorneys and other users.</p>
                <Button onClick={handleNavigateToUsers}>Manage Users</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>System-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure system settings and preferences.</p>
                <Button onClick={handleNavigateToSettings}>System Settings</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminDashboard;
