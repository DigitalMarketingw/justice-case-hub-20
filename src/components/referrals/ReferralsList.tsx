
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Referral {
  id: string;
  case_id: string;
  referring_attorney_id: string | null;
  referred_to_attorney_id: string | null;
  referral_source: string;
  external_source_name: string | null;
  referral_date: string;
  referral_reason: string;
  status: string;
  referral_fee: number;
  client_consent_obtained: boolean;
  case: {
    title: string;
    case_number: string;
  };
  referring_attorney: {
    first_name: string;
    last_name: string;
  } | null;
  referred_to_attorney: {
    first_name: string;
    last_name: string;
  } | null;
}

interface ReferralsListProps {
  onRefresh: () => void;
}

export function ReferralsList({ onRefresh }: ReferralsListProps) {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('case_referrals')
        .select(`
          *,
          case:cases(title, case_number),
          referring_attorney:profiles!case_referrals_referring_attorney_id_fkey(first_name, last_name),
          referred_to_attorney:profiles!case_referrals_referred_to_attorney_id_fkey(first_name, last_name)
        `)
        .order('referral_date', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: "Error loading referrals",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const updateReferralStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('case_referrals')
        .update({ 
          status,
          processed_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Referral updated",
        description: `Referral ${status} successfully.`,
      });

      fetchReferrals();
      onRefresh();
    } catch (error) {
      console.error('Error updating referral:', error);
      toast({
        title: "Error updating referral",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  if (loading) {
    return <div className="animate-pulse">Loading referrals...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Referrals</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{referral.case.case_number}</div>
                    <div className="text-sm text-gray-500">{referral.case.title}</div>
                  </div>
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
                    <span className="text-gray-500">External</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <Badge variant="outline">{referral.referral_source}</Badge>
                    {referral.external_source_name && (
                      <div className="text-xs text-gray-500 mt-1">
                        {referral.external_source_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(referral.referral_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {referral.referral_fee > 0 ? `$${referral.referral_fee}` : '-'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(referral.status)}
                </TableCell>
                <TableCell>
                  <Badge variant={referral.client_consent_obtained ? 'default' : 'secondary'}>
                    {referral.client_consent_obtained ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {referral.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReferralStatus(referral.id, 'accepted')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReferralStatus(referral.id, 'declined')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
