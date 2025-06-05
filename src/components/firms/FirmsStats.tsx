
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, UserCheck, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function FirmsStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['firms-stats'],
    queryFn: async () => {
      // Get total firms count
      const { count: firmsCount } = await supabase
        .from('firms')
        .select('*', { count: 'exact', head: true });

      // Get firm admins count
      const { count: firmAdminsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'firm_admin');

      // Get active firm admins count
      const { count: activeFirmAdminsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'firm_admin')
        .eq('is_active', true);

      // Get firms without admins
      const { data: firmsWithAdmins } = await supabase
        .from('profiles')
        .select('firm_id')
        .eq('role', 'firm_admin')
        .not('firm_id', 'is', null);

      const firmIdsWithAdmins = firmsWithAdmins?.map(fa => fa.firm_id) || [];
      
      const { count: firmsWithoutAdminsCount } = await supabase
        .from('firms')
        .select('*', { count: 'exact', head: true })
        .not('id', 'in', `(${firmIdsWithAdmins.length > 0 ? firmIdsWithAdmins.join(',') : 'null'})`);

      return {
        totalFirms: firmsCount || 0,
        totalFirmAdmins: firmAdminsCount || 0,
        activeFirmAdmins: activeFirmAdminsCount || 0,
        firmsWithoutAdmins: firmsWithoutAdminsCount || 0,
      };
    },
  });

  const statsData = [
    {
      title: "Total Firms",
      value: isLoading ? "..." : stats?.totalFirms.toString() || "0",
      icon: Building,
      description: "Total registered firms",
    },
    {
      title: "Firm Admins",
      value: isLoading ? "..." : stats?.totalFirmAdmins.toString() || "0",
      icon: Users,
      description: "Total firm administrators",
    },
    {
      title: "Active Admins",
      value: isLoading ? "..." : stats?.activeFirmAdmins.toString() || "0",
      icon: UserCheck,
      description: "Currently active firm admins",
    },
    {
      title: "Firms Without Admins",
      value: isLoading ? "..." : stats?.firmsWithoutAdmins.toString() || "0",
      icon: AlertCircle,
      description: "Firms needing admin assignment",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
