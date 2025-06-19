
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EnhancedStatsCard } from "@/components/dashboard/EnhancedStatsCard";
import { EnhancedQuickActions } from "@/components/dashboard/EnhancedQuickActions";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { Users, FileText, Calendar, Building, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface CaseManagerStats {
  totalClients: number;
  activeCases: number;
  upcomingEvents: number;
  managedAttorneys: number;
}

const CaseManagerDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<CaseManagerStats>({
    totalClients: 0,
    activeCases: 0,
    upcomingEvents: 0,
    managedAttorneys: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchStats();
    }
  }, [user, profile]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get cases from firm
      let activeCases = 0;
      try {
        const { data: casesData, error: casesError } = await supabase
          .from('cases')
          .select('id, status, client_id')
          .eq('firm_id', profile?.firm_id);

        if (casesError) {
          console.error('Error fetching cases:', casesError);
        } else {
          activeCases = casesData?.filter(c => c.status === 'active').length || 0;
        }
      } catch (err) {
        console.error('Cases query failed:', err);
      }

      // Get clients from firm
      let totalClients = 0;
      try {
        const { data: clientsData, error: clientsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('firm_id', profile?.firm_id)
          .eq('role', 'client')
          .eq('is_active', true);

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        } else {
          totalClients = clientsData?.length || 0;
        }
      } catch (err) {
        console.error('Clients query failed:', err);
      }

      // Get attorneys from firm
      let managedAttorneys = 0;
      try {
        const { data: attorneysData, error: attorneysError } = await supabase
          .from('profiles')
          .select('id')
          .eq('firm_id', profile?.firm_id)
          .eq('role', 'attorney')
          .eq('is_active', true);

        if (attorneysError) {
          console.error('Error fetching attorneys:', attorneysError);
        } else {
          managedAttorneys = attorneysData?.length || 0;
        }
      } catch (err) {
        console.error('Attorneys query failed:', err);
      }

      // Mock upcoming events
      const upcomingEvents = 5; // Mock data

      setStats({
        totalClients,
        activeCases,
        upcomingEvents,
        managedAttorneys
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-white">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading your dashboard...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-white">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card className="max-w-md mx-auto mt-8">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Error Loading Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchStats}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-white">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Case Manager Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Manage cases, clients, and coordinate with attorneys.
                </p>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <EnhancedStatsCard
                  title="Total Clients"
                  value={loading ? "..." : stats.totalClients.toString()}
                  change="+3% from last month"
                  trend="up"
                  icon={Users}
                  description="Active clients"
                />
                <EnhancedStatsCard
                  title="Active Cases"
                  value={loading ? "..." : stats.activeCases.toString()}
                  change="+7% from last month"
                  trend="up"
                  icon={FileText}
                  variant="gradient"
                  description="In progress"
                />
                <EnhancedStatsCard
                  title="Upcoming Events"
                  value={loading ? "..." : stats.upcomingEvents.toString()}
                  change="No change"
                  trend="neutral"
                  icon={Calendar}
                  description="This week"
                />
                <EnhancedStatsCard
                  title="Managed Attorneys"
                  value={loading ? "..." : stats.managedAttorneys.toString()}
                  change="+1 from last month"
                  trend="up"
                  icon={Building}
                  variant="glass"
                  description="In your firm"
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-5">
                  <ActivityTimeline />
                </div>
                <div className="md:col-span-3">
                  <EnhancedQuickActions />
                </div>
                <div className="md:col-span-4">
                  <PerformanceMetrics />
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default CaseManagerDashboard;
