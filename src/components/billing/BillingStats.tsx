
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, FileText, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BillingStatsData {
  totalRevenue: number;
  unbilledHours: number;
  pendingInvoices: number;
  averageHourlyRate: number;
}

export function BillingStats() {
  const [stats, setStats] = useState<BillingStatsData>({
    totalRevenue: 0,
    unbilledHours: 0,
    pendingInvoices: 0,
    averageHourlyRate: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total revenue from paid invoices
      const { data: paidInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid');

      const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;

      // Get unbilled hours from billing entries
      const { data: unbilledEntries } = await supabase
        .from('billing_entries')
        .select('hours_worked')
        .eq('is_billable', true);

      const totalUnbilledHours = unbilledEntries?.reduce((sum, entry) => sum + Number(entry.hours_worked), 0) || 0;

      // Get pending invoices count
      const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('id')
        .in('status', ['pending', 'sent']);

      // Get average hourly rate from billing entries
      const { data: allEntries } = await supabase
        .from('billing_entries')
        .select('hourly_rate');

      const avgRate = allEntries?.length 
        ? allEntries.reduce((sum, entry) => sum + Number(entry.hourly_rate), 0) / allEntries.length 
        : 0;

      setStats({
        totalRevenue,
        unbilledHours: totalUnbilledHours,
        pendingInvoices: pendingInvoices?.length || 0,
        averageHourlyRate: avgRate,
      });
    } catch (error) {
      console.error('Error fetching billing stats:', error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From paid invoices</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unbilled Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unbilledHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Hours not yet invoiced</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
          <p className="text-xs text-muted-foreground">Pending and sent invoices</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.averageHourlyRate.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">Average billing rate</p>
        </CardContent>
      </Card>
    </div>
  );
}
