
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ApprovalInterface } from "./ApprovalInterface";
import { ReferralComments } from "./ReferralComments";
import { WorkflowTimeline } from "./WorkflowTimeline";

interface ReferralWorkflowManagerProps {
  referralId: string;
  onStatusChange?: () => void;
}

interface Approval {
  id: string;
  approval_type: string;
  status: string;
  comments: string | null;
  approved_at: string | null;
  approver: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

interface Referral {
  id: string;
  workflow_stage: string;
  status: string;
  priority_level: string;
  deadline_date: string | null;
  risk_assessment_score: number | null;
  requires_case_manager_approval: boolean;
  requires_firm_admin_approval: boolean;
  requires_compliance_review: boolean;
  case: {
    case_number: string;
    title: string;
  };
}

export function ReferralWorkflowManager({ referralId, onStatusChange }: ReferralWorkflowManagerProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferralDetails = async () => {
    try {
      const { data: referralData, error: referralError } = await supabase
        .from('case_referrals')
        .select(`
          *,
          case:cases(case_number, title)
        `)
        .eq('id', referralId)
        .single();

      if (referralError) throw referralError;

      const { data: approvalsData, error: approvalsError } = await supabase
        .from('referral_approvals')
        .select(`
          *,
          approver:profiles(first_name, last_name, role)
        `)
        .eq('referral_id', referralId)
        .order('created_at', { ascending: true });

      if (approvalsError) throw approvalsError;

      setReferral(referralData);
      setApprovals(approvalsData || []);
    } catch (error) {
      console.error('Error fetching referral details:', error);
      toast({
        title: "Error loading referral details",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralDetails();
  }, [referralId]);

  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      const { error } = await supabase
        .from('referral_approvals')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          comments,
          approved_at: new Date().toISOString(),
        })
        .eq('id', approvalId);

      if (error) throw error;

      toast({
        title: `Referral ${action === 'approve' ? 'approved' : 'rejected'}`,
        description: "The referral status has been updated.",
      });

      fetchReferralDetails();
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating approval:', error);
      toast({
        title: "Error updating approval",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getWorkflowStageLabel = (stage: string) => {
    const labels = {
      'attorney_initiated': 'Attorney Initiated',
      'pending_case_manager': 'Pending Case Manager',
      'pending_firm_admin': 'Pending Firm Admin',
      'pending_compliance': 'Pending Compliance',
      'fully_approved': 'Fully Approved',
      'rejected': 'Rejected',
      'in_progress': 'In Progress'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'bg-green-100 text-green-800';
    if (score <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const canUserApprove = (approval: Approval) => {
    if (!profile) return false;
    
    // Check if user is the assigned approver and approval is pending
    if (approval.status !== 'pending') return false;
    
    // Role-based approval permissions
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
  };

  if (loading) {
    return <div className="animate-pulse">Loading workflow details...</div>;
  }

  if (!referral) {
    return <div>Referral not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Referral Workflow</CardTitle>
              <CardDescription>
                Case: {referral.case.case_number} - {referral.case.title}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge className={getPriorityColor(referral.priority_level)}>
                {referral.priority_level.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {getWorkflowStageLabel(referral.workflow_stage)}
              </Badge>
              {referral.risk_assessment_score && (
                <Badge className={getRiskColor(referral.risk_assessment_score)}>
                  Risk: {referral.risk_assessment_score}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">
                Case Manager: {referral.requires_case_manager_approval ? 'Required' : 'Not Required'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm">
                Firm Admin: {referral.requires_firm_admin_approval ? 'Required' : 'Not Required'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm">
                Compliance: {referral.requires_compliance_review ? 'Required' : 'Not Required'}
              </span>
            </div>
          </div>
          {referral.deadline_date && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Deadline: {new Date(referral.deadline_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <div className="space-y-4">
            {approvals.map((approval) => (
              <ApprovalInterface
                key={approval.id}
                approval={approval}
                canApprove={canUserApprove(approval)}
                onAction={handleApprovalAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <WorkflowTimeline 
            referralId={referralId}
            approvals={approvals}
          />
        </TabsContent>

        <TabsContent value="comments">
          <ReferralComments 
            referralId={referralId}
            onCommentAdded={fetchReferralDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
