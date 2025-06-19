
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface ReferralAlert {
  type: 'incoming_concentration' | 'outgoing_concentration';
  attorneyId: string;
  source?: string;
  destination?: string;
  percentage: string;
  count: number;
  severity: 'high' | 'medium';
}

interface ReferralAlertsProps {
  alerts: ReferralAlert[];
}

export function ReferralAlerts({ alerts }: ReferralAlertsProps) {
  const getSeverityIcon = (severity: string) => {
    return severity === 'high' ? AlertTriangle : AlertCircle;
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'high' ? 'text-red-600' : 'text-orange-600';
  };

  const getAlertMessage = (alert: ReferralAlert) => {
    if (alert.type === 'incoming_concentration') {
      return `Attorney receiving ${alert.percentage}% of referrals from single source "${alert.source}" (${alert.count} cases)`;
    } else {
      return `Attorney referring ${alert.percentage}% of cases to single destination "${alert.destination}" (${alert.count} cases)`;
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const Icon = getSeverityIcon(alert.severity);
        return (
          <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg bg-white">
            <Icon className={`w-5 h-5 mt-0.5 ${getSeverityColor(alert.severity)}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                  {alert.severity === 'high' ? 'High Risk' : 'Medium Risk'}
                </Badge>
                <Badge variant="outline">
                  {alert.type === 'incoming_concentration' ? 'Incoming' : 'Outgoing'}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">
                {getAlertMessage(alert)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {alert.type === 'incoming_concentration' 
                  ? 'Consider diversifying referral sources to avoid ethical concerns'
                  : 'Consider reviewing referral patterns for potential conflicts'
                }
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
