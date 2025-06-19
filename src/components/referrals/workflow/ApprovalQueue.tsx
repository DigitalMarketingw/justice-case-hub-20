
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, AlertTriangle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ReferralWorkflowManager } from "./ReferralWorkflowManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PendingApproval {
  id: string;
  referral_id: string;
  approval_type: string;
  created_at: string;
  referral: {
    case: {
      case_number: string;
      title: string;
    };
    referring_attorney: {
      first_name: string;
      last_name: string;
    };
    priority_level: string;
    deadline_date: string | null;
    referral_fee: number;
  };
}

export function ApprovalQueue() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferralId, setSelectedReferral] = useState<string | null>(null);

  const fetchPendingApprovals = async () => {
    if (!profile) return;

    try {
      // Get approvals that this user can handle
      const { data, error } = await supabase
        .from('referral_approvals')
        .select(`
          *,
          referral:case_referrals(
            case:cases(case_number, title),
            referring_attorney:profiles!case_referrals_referring_attorney_id_fkey(first_name, last_name),
            priority_level,
            deadline_date,
            referral_fee
          )
        `)
        .eq('status', 'pending')
        .or(`
          approval_type.eq.case_manager,
          approval_type.eq.firm_admin,
          approval_type.eq.compliance
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter based on user role
      const filteredApprovals = (data || []).filter(approval => {
        switch (approval.approval_type) {
          case 'case_manager':
            return profile.role === 'case_manager' || 
                   profile.role === 'firm_admin' || 
                   profile.role === 'super_admin';
          case 'firm_admin':
            return profile.role === 'firm_admin' || profile.role === 'super_admin';
          case 'compliance':
            return profile.role === 'super_admin' || profile.role === 'firm_admin';
          default:
            return false;
        }
      });

      setPendingApprovals(filteredApprovals);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast({
        title: "Error loading pending approvals",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [profile]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getApprovalTypeLabel = (type: string) => {
    const labels = {
      'case_manager': 'Case Manager',
      'firm_admin': 'Firm Admin',
      'compliance': 'Compliance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const isOverdue = (deadlineDate: string | null) => {
    if (!deadlineDate) return false;
    return new Date(deadlineDate) < new Date();
  };

  if (loading) {
    return <div className="animate-pulse">Loading approval queue...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Approvals
          </CardTitle>
          <CardDescription>
            Referrals requiring your approval ({pendingApprovals.length} pending)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending approvals</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Attorney</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {approval.referral.case.case_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {approval.referral.case.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {approval.referral.referring_attorney.first_name}{' '}
                      {approval.referral.referring_attorney.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getApprovalTypeLabel(approval.approval_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(approval.referral.priority_level)}>
                        {approval.referral.priority_level.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${approval.referral.referral_fee || 0}
                    </TableCell>
                    <TableCell>
                      {approval.referral.deadline_date ? (
                        <div className={`flex items-center ${isOverdue(approval.referral.deadline_date) ? 'text-red-600' : ''}`}>
                          {isOverdue(approval.referral.deadline_date) && (
                            <AlertTriangle className="w-4 h-4 mr-1" />
                          )}
                          {format(new Date(approval.referral.deadline_date), 'MMM dd')}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReferral(approval.referral_id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReferralId} onOpenChange={() => setSelectedReferral(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Referral Review</DialogTitle>
          </DialogHeader>
          {selectedReferralId && (
            <ReferralWorkflowManager
              referralId={selectedReferralId}
              onStatusChange={() => {
                fetchPendingApprovals();
                setSelectedReferral(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
