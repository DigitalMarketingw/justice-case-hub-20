
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Clock, DollarSign } from "lucide-react";

interface MetricData {
  label: string;
  current: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
}

export function PerformanceMetrics() {
  const metrics: MetricData[] = [
    {
      label: "Monthly Revenue",
      current: 94500,
      target: 100000,
      unit: "$",
      trend: "up",
      trendValue: "+18%"
    },
    {
      label: "Billable Hours",
      current: 156,
      target: 180,
      unit: "hrs",
      trend: "up",
      trendValue: "+12%"
    },
    {
      label: "Client Satisfaction",
      current: 4.8,
      target: 5.0,
      unit: "/5",
      trend: "up",
      trendValue: "+0.3"
    },
    {
      label: "Case Resolution",
      current: 78,
      target: 85,
      unit: "%",
      trend: "neutral",
      trendValue: "0%"
    }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-success-500";
    if (percentage >= 70) return "bg-warning-500";
    return "bg-destructive-500";
  };

  const getTrendColor = (trend: MetricData["trend"]) => {
    switch (trend) {
      case "up": return "text-success-600 bg-success-100";
      case "down": return "text-destructive-600 bg-destructive-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getIcon = (index: number) => {
    const icons = [DollarSign, Clock, Target, TrendingUp];
    return icons[index] || TrendingUp;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric, index) => {
          const percentage = (metric.current / metric.target) * 100;
          const Icon = getIcon(index);
          
          return (
            <div key={metric.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                    <p className="text-xs text-gray-500">
                      Target: {metric.unit === "$" ? "$" : ""}{metric.target.toLocaleString()}{metric.unit !== "$" ? metric.unit : ""}
                    </p>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold text-gray-900">
                    {metric.unit === "$" ? "$" : ""}{metric.current.toLocaleString()}{metric.unit !== "$" ? metric.unit : ""}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={getTrendColor(metric.trend)}
                  >
                    {metric.trendValue}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
