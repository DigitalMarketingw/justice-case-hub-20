
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Calendar, Clock, FileText, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "client" | "case" | "appointment" | "document" | "billing";
  title: string;
  description: string;
  time: string;
  status: "new" | "progress" | "completed" | "urgent" | "scheduled";
  user?: string;
  priority?: "low" | "medium" | "high";
}

export function ActivityTimeline() {
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "client",
      title: "New client consultation",
      description: "Sarah Johnson - Personal Injury Case scheduled for review",
      time: "2 hours ago",
      status: "new",
      user: "John Doe",
      priority: "high"
    },
    {
      id: "2",
      type: "case",
      title: "Case status updated",
      description: "Smith vs. ABC Corp - Discovery phase completed, moving to negotiations",
      time: "4 hours ago",
      status: "progress",
      priority: "medium"
    },
    {
      id: "3",
      type: "document",
      title: "Document uploaded",
      description: "Contract amendment for Johnson case uploaded to case files",
      time: "6 hours ago",
      status: "completed",
      priority: "low"
    },
    {
      id: "4",
      type: "appointment",
      title: "Court hearing reminder",
      description: "Wilson vs. State - Hearing scheduled for tomorrow 10:00 AM",
      time: "Tomorrow 10:00 AM",
      status: "urgent",
      priority: "high"
    },
    {
      id: "5",
      type: "billing",
      title: "Invoice generated",
      description: "Monthly billing for Martinez case - $4,500 sent to client",
      time: "1 day ago",
      status: "completed",
      priority: "medium"
    }
  ];

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "client": return User;
      case "case": return Briefcase;
      case "appointment": return Calendar;
      case "document": return FileText;
      case "billing": return Users;
      default: return Clock;
    }
  };

  const getStatusColor = (status: ActivityItem["status"]) => {
    switch (status) {
      case "new": return "bg-success-100 text-success-800 border-success-200";
      case "progress": return "bg-primary-100 text-primary-800 border-primary-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "urgent": return "bg-destructive-100 text-destructive-800 border-destructive-200";
      case "scheduled": return "bg-warning-100 text-warning-800 border-warning-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: ActivityItem["priority"]) => {
    switch (priority) {
      case "high": return "border-l-destructive-500";
      case "medium": return "border-l-warning-500";
      case "low": return "border-l-success-500";
      default: return "border-l-gray-300";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div 
              key={activity.id} 
              className={cn(
                "relative flex items-start space-x-4 p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md hover:bg-gray-50/50",
                getPriorityColor(activity.priority),
                index !== activities.length - 1 && "border-b border-gray-100"
              )}
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(activity.status))}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </span>
                  {activity.user && (
                    <span className="text-primary-600 font-medium">
                      {activity.user}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
