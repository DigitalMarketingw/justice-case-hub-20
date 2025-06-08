
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  Eye, 
  AlertTriangle,
  Globe
} from "lucide-react";

interface SecurityIndicatorsProps {
  showDetailed?: boolean;
}

const SecurityIndicators = ({ showDetailed = false }: SecurityIndicatorsProps) => {
  const securityFeatures = [
    {
      icon: Shield,
      title: "SSL Encryption",
      description: "256-bit SSL encryption protects all data transmission",
      status: "active",
      color: "text-success-600"
    },
    {
      icon: Lock,
      title: "SOC 2 Compliant",
      description: "Independently audited security controls",
      status: "certified",
      color: "text-primary-600"
    },
    {
      icon: CheckCircle,
      title: "ABA Compliant",
      description: "Meets American Bar Association technology standards",
      status: "compliant",
      color: "text-success-600"
    },
    {
      icon: Eye,
      title: "Privacy Protected",
      description: "GDPR and CCPA compliant data handling",
      status: "protected",
      color: "text-primary-600"
    }
  ];

  const threatDetection = [
    {
      icon: AlertTriangle,
      title: "Threat Detection",
      description: "24/7 monitoring for suspicious activity",
      status: "monitoring",
      color: "text-warning-600"
    },
    {
      icon: Globe,
      title: "Global Infrastructure",
      description: "99.9% uptime with redundant data centers",
      status: "operational",
      color: "text-success-600"
    }
  ];

  if (!showDetailed) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {securityFeatures.slice(0, 3).map((feature, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className="text-xs bg-success-50 text-success-700 border-success-200"
          >
            <feature.icon className="w-3 h-3 mr-1" />
            {feature.title}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-gray-200 bg-gray-50/50">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Enterprise Security & Compliance
            </h4>
            <p className="text-xs text-gray-600">
              Your data is protected by industry-leading security measures
            </p>
          </div>

          <div className="grid gap-4">
            {[...securityFeatures, ...threatDetection].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {feature.title}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        feature.status === 'active' || feature.status === 'compliant' || feature.status === 'operational'
                          ? 'bg-success-50 text-success-700 border-success-200'
                          : feature.status === 'monitoring'
                          ? 'bg-warning-50 text-warning-700 border-warning-200'
                          : 'bg-primary-50 text-primary-700 border-primary-200'
                      }`}
                    >
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Security certifications verified by independent auditors
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityIndicators;
