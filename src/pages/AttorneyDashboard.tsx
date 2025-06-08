import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EnhancedStatsCard } from "@/components/dashboard/EnhancedStatsCard";
import { EnhancedQuickActions } from "@/components/dashboard/EnhancedQuickActions";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-white">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Attorney Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back! Here's an overview of your practice.
              </p>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <EnhancedStatsCard
                title="Total Clients"
                value={loading ? "..." : stats.totalClients.toString()}
                change="+5% from last month"
                trend="up"
                icon={Users}
                description="Active clients"
              />
              <EnhancedStatsCard
                title="Active Cases"
                value={loading ? "..." : stats.activeCases.toString()}
                change="+2% from last month"
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
                title="Monthly Revenue"
                value={loading ? "..." : `$${stats.monthlyRevenue.toLocaleString()}`}
                change="+12% from last month"
                trend="up"
                icon={DollarSign}
                variant="glass"
                description="This month"
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
  );
};

export default AttorneyDashboard;
