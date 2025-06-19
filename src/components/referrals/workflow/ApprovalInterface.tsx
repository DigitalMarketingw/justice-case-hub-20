
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface ApprovalInterfaceProps {
  approval: {
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
  };
  canApprove: boolean;
  onAction: (approvalId: string, action: 'approve' | 'reject', comments?: string) => void;
}

export function ApprovalInterface({ approval, canApprove, onAction }: ApprovalInterfaceProps) {
  const [comments, setComments] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const getApprovalTypeLabel = (type: string) => {
    const labels = {
      'case_manager': 'Case Manager Approval',
      'firm_admin': 'Firm Admin Approval',
      'compliance': 'Compliance Review'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAction = (action: 'approve' | 'reject') => {
    if (comments.trim()) {
      onAction(approval.id, action, comments);
      setShowCommentForm(false);
      setComments('');
      setActionType(null);
    } else {
      setActionType(action);
      setShowCommentForm(true);
    }
  };

  const submitAction = () => {
    if (actionType) {
      onAction(approval.id, actionType, comments);
      setShowCommentForm(false);
      setComments('');
      setActionType(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {getApprovalTypeLabel(approval.approval_type)}
          </CardTitle>
          {getStatusBadge(approval.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Assigned to: {approval.approver.first_name} {approval.approver.last_name}
          </span>
          <Badge variant="outline" className="text-xs">
            {approval.approver.role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {approval.approved_at && (
          <div className="text-sm text-gray-600">
            {approval.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
            {format(new Date(approval.approved_at), 'MMM dd, yyyy at h:mm a')}
          </div>
        )}

        {approval.comments && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Comments:</Label>
            <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
          </div>
        )}

        {canApprove && approval.status === 'pending' && (
          <div className="space-y-3">
            {!showCommentForm ? (
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleAction('approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction('reject')}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="approval-comments">
                    Comments {actionType === 'reject' ? '(Required for rejection)' : '(Optional)'}
                  </Label>
                  <Textarea
                    id="approval-comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={
                      actionType === 'approve' 
                        ? "Add any notes about your approval..." 
                        : "Please explain why you're rejecting this referral..."
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={submitAction}
                    disabled={actionType === 'reject' && !comments.trim()}
                    className={actionType === 'approve' ? "bg-green-600 hover:bg-green-700" : ""}
                    variant={actionType === 'reject' ? "destructive" : "default"}
                  >
                    {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCommentForm(false);
                      setComments('');
                      setActionType(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
