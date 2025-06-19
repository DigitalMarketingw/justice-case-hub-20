
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { ReferralsList } from "./ReferralsList";
import { ReferralAnalytics } from "./ReferralAnalytics";
import { ReferralAlerts } from "./ReferralAlerts";
import { CreateReferralDialog } from "./CreateReferralDialog";
import { ReferralStatsCards } from "./ReferralStatsCards";
import { ReferralDashboardHeader } from "./ReferralDashboardHeader";
import { ApprovalQueue } from "./workflow/ApprovalQueue";
import { useReferralStats } from "./hooks/useReferralStats";
import { useAuth } from "@/contexts/AuthContext";

export function ReferralDashboardEnhanced() {
  const { profile } = useAuth();
  const [showCreateReferral, setShowCreateReferral] = useState(false);
  const { stats, alerts, loading, fetchStats } = useReferralStats();

  const canCreateReferrals = profile?.role === 'attorney' || 
                            profile?.role === 'firm_admin' || 
                            profile?.role === 'super_admin';

  const canViewApprovals = profile?.role === 'case_manager' || 
                          profile?.role === 'firm_admin' || 
                          profile?.role === 'super_admin';

  if (loading) {
    return <div className="animate-pulse">Loading referral dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <ReferralDashboardHeader 
        onCreateReferral={canCreateReferrals ? () => setShowCreateReferral(true) : undefined} 
      />

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

      <ReferralStatsCards stats={stats} />

      {/* Main Content */}
      <Tabs defaultValue={canViewApprovals ? "approvals" : "referrals"} className="space-y-4">
        <TabsList>
          {canViewApprovals && (
            <TabsTrigger value="approvals" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending Approvals
            </TabsTrigger>
          )}
          <TabsTrigger value="referrals" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            All Referrals
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        {canViewApprovals && (
          <TabsContent value="approvals">
            <ApprovalQueue />
          </TabsContent>
        )}

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

      {canCreateReferrals && (
        <CreateReferralDialog 
          open={showCreateReferral}
          onOpenChange={setShowCreateReferral}
          onSuccess={fetchStats}
        />
      )}
    </div>
  );
}
