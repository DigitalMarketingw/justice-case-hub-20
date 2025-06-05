
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, Calendar } from "lucide-react";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "client",
      title: "New client added",
      description: "Sarah Johnson - Personal Injury Case",
      time: "2 hours ago",
      icon: User,
      status: "new",
    },
    {
      id: 2,
      type: "case",
      title: "Case updated",
      description: "Smith vs. ABC Corp - Discovery phase completed",
      time: "4 hours ago",
      icon: Briefcase,
      status: "progress",
    },
    {
      id: 3,
      type: "appointment",
      title: "Upcoming appointment",
      description: "Client consultation with Michael Brown",
      time: "Tomorrow 10:00 AM",
      icon: Calendar,
      status: "scheduled",
    },
    {
      id: 4,
      type: "case",
      title: "Case closed",
      description: "Johnson Family Trust - Successfully completed",
      time: "1 day ago",
      icon: Briefcase,
      status: "completed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-green-100 text-green-800";
      case "progress": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
