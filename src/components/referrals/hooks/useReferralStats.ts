
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  thisMonthReferrals: number;
  averageReferralFee: number;
}

interface ReferralAlert {
  type: 'incoming_concentration' | 'outgoing_concentration';
  attorneyId: string;
  source?: string;
  destination?: string;
  percentage: string;
  count: number;
  severity: 'high' | 'medium';
}

export function useReferralStats() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    thisMonthReferrals: 0,
    averageReferralFee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ReferralAlert[]>([]);

  const calculateReferralAlerts = async (referrals: any[]) => {
    const alertsFound: ReferralAlert[] = [];
    
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
      const totalIncoming = Object.values(sources).reduce((sum: number, count: any) => sum + Number(count), 0);
      Object.entries(sources).forEach(([source, count]: [string, any]) => {
        const percentage = (Number(count) / Number(totalIncoming)) * 100;
        if (percentage > 30) {
          alertsFound.push({
            type: 'incoming_concentration',
            attorneyId,
            source,
            percentage: percentage.toFixed(1),
            count: Number(count),
            severity: percentage > 50 ? 'high' : 'medium'
          });
        }
      });
    });

    Object.entries(outgoingByAttorney).forEach(([attorneyId, destinations]: [string, any]) => {
      const totalOutgoing = Object.values(destinations).reduce((sum: number, count: any) => sum + Number(count), 0);
      Object.entries(destinations).forEach(([destination, count]: [string, any]) => {
        const percentage = (Number(count) / Number(totalOutgoing)) * 100;
        if (percentage > 50) {
          alertsFound.push({
            type: 'outgoing_concentration',
            attorneyId,
            destination,
            percentage: percentage.toFixed(1),
            count: Number(count),
            severity: 'high'
          });
        }
      });
    });

    setAlerts(alertsFound);
  };

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

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    alerts,
    loading,
    fetchStats
  };
}
