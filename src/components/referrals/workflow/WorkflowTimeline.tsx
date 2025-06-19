
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Play, Flag } from "lucide-react";
import { format } from "date-fns";

interface WorkflowTimelineProps {
  referralId: string;
  approvals: Array<{
    id: string;
    approval_type: string;
    status: string;
    approved_at: string | null;
    approver: {
      first_name: string;
      last_name: string;
    };
  }>;
}

export function WorkflowTimeline({ approvals }: WorkflowTimelineProps) {
  const getTimelineItems = () => {
    const items = [
      {
        id: 'initiated',
        title: 'Referral Initiated',
        description: 'Attorney submitted the case referral',
        status: 'completed',
        timestamp: new Date().toISOString(), // This would come from referral creation date
        icon: Play,
      }
    ];

    // Add approval steps
    approvals.forEach((approval) => {
      items.push({
        id: approval.id,
        title: `${approval.approval_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Review`,
        description: approval.status === 'approved' 
          ? `Approved by ${approval.approver.first_name} ${approval.approver.last_name}`
          : approval.status === 'rejected'
          ? `Rejected by ${approval.approver.first_name} ${approval.approver.last_name}`
          : `Waiting for ${approval.approver.first_name} ${approval.approver.last_name}`,
        status: approval.status,
        timestamp: approval.approved_at || new Date().toISOString(),
        icon: approval.status === 'approved' ? CheckCircle : 
              approval.status === 'rejected' ? XCircle : Clock,
      });
    });

    // Add final step if all approved
    const allApproved = approvals.length > 0 && approvals.every(a => a.status === 'approved');
    if (allApproved) {
      items.push({
        id: 'completed',
        title: 'Referral Completed',
        description: 'All approvals received, referral is now active',
        status: 'completed',
        timestamp: new Date().toISOString(),
        icon: Flag,
      });
    }

    return items;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const timelineItems = getTimelineItems();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {timelineItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === timelineItems.length - 1;
            
            return (
              <div key={item.id} className="flex items-start space-x-4 pb-6">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(item.status)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.status === 'approved' || item.status === 'completed' 
                          ? 'border-green-200 text-green-700'
                          : item.status === 'rejected'
                          ? 'border-red-200 text-red-700'
                          : 'border-yellow-200 text-yellow-700'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                  {item.timestamp && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.timestamp), 'MMM dd, yyyy at h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
