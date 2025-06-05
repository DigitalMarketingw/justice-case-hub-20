
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function CasesStats() {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    upcomingCourtDates: 0,
    closedCases: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total cases
        const { count: totalCases } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true });

        // Active cases
        const { count: activeCases } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Closed cases
        const { count: closedCases } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'closed');

        // Upcoming court dates (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const { count: upcomingCourtDates } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .not('courtdate', 'is', null)
          .gte('courtdate', new Date().toISOString())
          .lte('courtdate', thirtyDaysFromNow.toISOString());

        setStats({
          totalCases: totalCases || 0,
          activeCases: activeCases || 0,
          upcomingCourtDates: upcomingCourtDates || 0,
          closedCases: closedCases || 0
        });
      } catch (error) {
        console.error('Error fetching cases stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: Briefcase,
      color: "text-blue-600"
    },
    {
      title: "Active Cases",
      value: stats.activeCases,
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Upcoming Court Dates",
      value: stats.upcomingCourtDates,
      icon: Calendar,
      color: "text-orange-600"
    },
    {
      title: "Closed Cases",
      value: stats.closedCases,
      icon: CheckCircle,
      color: "text-gray-600"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
