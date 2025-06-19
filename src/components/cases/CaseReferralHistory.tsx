
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CaseReferralHistoryProps {
  caseId: string;
}

interface Referral {
  id: string;
  referring_attorney_id: string | null;
  referred_to_attorney_id: string | null;
  referral_source: string;
  external_source_name: string | null;
  referral_date: string;
  referral_reason: string;
  status: string;
  referral_fee: number;
  referring_attorney: {
    first_name: string;
    last_name: string;
  } | null;
  referred_to_attorney: {
    first_name: string;
    last_name: string;
  } | null;
}

export function CaseReferralHistory({ caseId }: CaseReferralHistoryProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralHistory();
  }, [caseId]);

  const fetchReferralHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('case_referrals')
        .select(`
          *,
          referring_attorney:profiles!case_referrals_referring_attorney_id_fkey(first_name, last_name),
          referred_to_attorney:profiles!case_referrals_referred_to_attorney_id_fkey(first_name, last_name)
        `)
        .eq('case_id', caseId)
        .order('referral_date', { ascending: true });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referral history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading referral history...</div>;
  }

  if (referrals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>This case has no referral history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No referrals have been made for this case.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowRight className="w-5 h-5 mr-2" />
          Referral History
        </CardTitle>
        <CardDescription>
          Complete referral chain for this case ({referrals.length} referral{referrals.length !== 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referrals.length > 1 && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm text-orange-800">
                This case has been referred multiple times. Please review for compliance.
              </span>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral, index) => (
              <TableRow key={referral.id}>
                <TableCell>
                  <Badge variant="outline">#{index + 1}</Badge>
                </TableCell>
                <TableCell>
                  {referral.referring_attorney ? (
                    `${referral.referring_attorney.first_name} ${referral.referring_attorney.last_name}`
                  ) : (
                    <span className="text-gray-500">External</span>
                  )}
                </TableCell>
                <TableCell>
                  {referral.referred_to_attorney ? (
                    `${referral.referred_to_attorney.first_name} ${referral.referred_to_attorney.last_name}`
                  ) : (
                    <span className="text-gray-500">
                      {referral.external_source_name || 'External'}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{referral.referral_source}</Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(referral.referral_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-sm truncate" title={referral.referral_reason}>
                      {referral.referral_reason}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {referral.referral_fee > 0 ? `$${referral.referral_fee}` : '-'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(referral.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
