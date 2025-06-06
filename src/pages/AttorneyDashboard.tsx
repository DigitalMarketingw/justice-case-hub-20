
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AttorneyStats {
  totalClients: number;
  activeCases: number;
  upcomingEvents: number;
  monthlyRevenue: number;
}

const AttorneyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttorneyStats>({
    totalClients: 0,
    activeCases: 0,
    upcomingEvents: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get cases count
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('id, status, client_id')
        .eq('attorney_id', user?.id);

      if (casesError) {
        console.error('Error fetching cases:', casesError);
      }

      const activeCases = casesData?.filter(c => c.status === 'active').length || 0;
      const totalCases = casesData?.length || 0;

      // Get billing entries for revenue calculation
      const { data: billingData, error: billingError } = await supabase
        .from('billing_entries')
        .select('total_amount, date_worked')
        .eq('attorney_id', user?.id);

      if (billingError) {
        console.error('Error fetching billing:', billingError);
      }

      // Calculate this month's revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = billingData
        ?.filter(entry => {
          const entryDate = new Date(entry.date_worked);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        })
        ?.reduce((sum, entry) => sum + (entry.total_amount || 0), 0) || 0;

      // Get unique clients from cases
      const uniqueClientIds = new Set(casesData?.map(c => c.client_id) || []);
      const totalClients = uniqueClientIds.size;

      // Mock upcoming events since calendar_events table doesn't exist
      const upcomingEvents = 3; // Mock data

      setStats({
        totalClients,
        activeCases,
        upcomingEvents,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Attorney Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's an overview of your practice.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Clients"
                value={stats.totalClients.toString()}
                icon={Users}
                loading={loading}
              />
              <StatsCard
                title="Active Cases"
                value={stats.activeCases.toString()}
                icon={FileText}
                loading={loading}
              />
              <StatsCard
                title="Upcoming Events"
                value={stats.upcomingEvents.toString()}
                icon={Calendar}
                loading={loading}
              />
              <StatsCard
                title="Monthly Revenue"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                icon={DollarSign}
                loading={loading}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <QuickActions />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AttorneyDashboard;
