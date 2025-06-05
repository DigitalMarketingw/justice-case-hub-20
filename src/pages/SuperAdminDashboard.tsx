
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Users, Settings, Building } from "lucide-react";

const SuperAdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [firmCount, setFirmCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      try {
        // Count firms
        const { count: firmCount, error: firmError } = await supabase
          .from('firms')
          .select('*', { count: 'exact', head: true });

        if (firmError) console.error('Error fetching firms:', firmError);
        else setFirmCount(firmCount || 0);

        // Count users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (userError) console.error('Error fetching users:', userError);
        else setUserCount(userCount || 0);

        // Count cases
        const { count: caseCount, error: caseError } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true });

        if (caseError) console.error('Error fetching cases:', caseError);
        else setCaseCount(caseCount || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleNavigateToFirms = () => {
    navigate('/firms');
  };

  const handleNavigateToCases = () => {
    navigate('/cases');
  };

  const handleNavigateToUsers = () => {
    navigate('/attorneys');
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
              <p className="text-gray-600">Welcome, {profile?.first_name} {profile?.last_name}</p>
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
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : caseCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Firms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : firmCount}</div>
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
