
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, ArrowRightLeft, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ReferralsList } from "./ReferralsList";
import { ReferralAnalytics } from "./ReferralAnalytics";
import { ReferralAlerts } from "./ReferralAlerts";
import { CreateReferralDialog } from "./CreateReferralDialog";

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  thisMonthReferrals: number;
  averageReferralFee: number;
}

export function CaseReferralDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    thisMonthReferrals: 0,
    averageReferralFee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateReferral, setShowCreateReferral] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const { data: referrals, error } = await supabase
        .from('case_referrals')
        .select('*');

      if (error) throw error;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonthReferrals = referrals?.filter(r => {
        const referralDate = new Date(r.referral_date);
        return referralDate.getMonth() === currentMonth && referralDate.getFullYear() === currentYear;
      }).length || 0;

      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalFees = referrals?.reduce((sum, r) => sum + (Number(r.referral_fee) || 0), 0) || 0;
      const averageReferralFee = referrals?.length ? totalFees / referrals.length : 0;

      setStats({
        totalReferrals: referrals?.length || 0,
        pendingReferrals,
        thisMonthReferrals,
        averageReferralFee,
      });

      // Calculate alerts for concentration risks
      await calculateReferralAlerts(referrals || []);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast({
        title: "Error loading referral data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateReferralAlerts = async (referrals: any[]) => {
    const alertsFound = [];
    
    // Group by attorney and source
    const incomingByAttorney = referrals.reduce((acc, r) => {
      if (!r.referred_to_attorney_id) return acc;
      if (!acc[r.referred_to_attorney_id]) acc[r.referred_to_attorney_id] = {};
      const source = r.external_source_name || r.referring_attorney_id;
      if (!acc[r.referred_to_attorney_id][source]) acc[r.referred_to_attorney_id][source] = 0;
      acc[r.referred_to_attorney_id][source]++;
      return acc;
    }, {});

    const outgoingByAttorney = referrals.reduce((acc, r) => {
      if (!r.referring_attorney_id) return acc;
      if (!acc[r.referring_attorney_id]) acc[r.referring_attorney_id] = {};
      const destination = r.external_source_name || r.referred_to_attorney_id;
      if (!acc[r.referring_attorney_id][destination]) acc[r.referring_attorney_id][destination] = 0;
      acc[r.referring_attorney_id][destination]++;
      return acc;
    }, {});

    // Check for concentration risks
    Object.entries(incomingByAttorney).forEach(([attorneyId, sources]: [string, any]) => {
      const totalIncoming = Object.values(sources).reduce((sum: number, count: any) => sum + count, 0);
      Object.entries(sources).forEach(([source, count]: [string, any]) => {
        const percentage = (count / totalIncoming) * 100;
        if (percentage > 30) {
          alertsFound.push({
            type: 'incoming_concentration',
            attorneyId,
            source,
            percentage: percentage.toFixed(1),
            count,
            severity: percentage > 50 ? 'high' : 'medium'
          });
        }
      });
    });

    Object.entries(outgoingByAttorney).forEach(([attorneyId, destinations]: [string, any]) => {
      const totalOutgoing = Object.values(destinations).reduce((sum: number, count: any) => sum + count, 0);
      Object.entries(destinations).forEach(([destination, count]: [string, any]) => {
        const percentage =  count / totalOutgoing) * 100;
        if (percentage > 50) {
          alertsFound.push({
            type: 'outgoing_concentration',
            attorneyId,
            destination,
            percentage: percentage.toFixed(1),
            count,
            severity: 'high'
          });
        }
      });
    });

    setAlerts(alertsFound);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading referral dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Case Referral Dashboard</h1>
          <p className="text-gray-600">Manage case referrals and monitor concentration risks</p>
        </div>
        <Button onClick={() => setShowCreateReferral(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Referral
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Concentration Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralAlerts alerts={alerts} />
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Referral Fee</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageReferralFee.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">All Referrals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <ReferralsList onRefresh={fetchStats} />
        </TabsContent>

        <TabsContent value="analytics">
          <ReferralAnalytics />
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Referral Sources</CardTitle>
              <CardDescription>Manage external referral sources and contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Referral sources management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateReferralDialog 
        open={showCreateReferral}
        onOpenChange={setShowCreateReferral}
        onSuccess={fetchStats}
      />
    </div>
  );
}
