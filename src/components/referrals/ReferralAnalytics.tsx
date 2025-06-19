
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export function ReferralAnalytics() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data: referrals, error } = await supabase
        .from('case_referrals')
        .select('*');

      if (error) throw error;

      // Process monthly data
      const monthlyStats = referrals?.reduce((acc, referral) => {
        const month = new Date(referral.referral_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!acc[month]) acc[month] = { month, count: 0, fees: 0 };
        acc[month].count++;
        acc[month].fees += Number(referral.referral_fee) || 0;
        return acc;
      }, {});

      setMonthlyData(Object.values(monthlyStats || {}));

      // Process source data
      const sourceStats = referrals?.reduce((acc: any, referral) => {
        const source = referral.referral_source;
        if (!acc[source]) acc[source] = { name: source, value: 0 };
        acc[source].value++;
        return acc;
      }, {});

      setSourceData(Object.values(sourceStats || {}));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Referral Trends</CardTitle>
          <CardDescription>Number of referrals and fees over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Referrals" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral Sources</CardTitle>
          <CardDescription>Distribution of referral sources</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
