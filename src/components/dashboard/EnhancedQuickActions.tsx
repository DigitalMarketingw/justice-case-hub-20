
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, User, Briefcase, Calendar, Plus, FileText, DollarSign, MessageSquare } from "lucide-react";

interface ActionItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  badge?: string;
  priority?: "high" | "medium" | "low";
}

export function EnhancedQuickActions() {
  const actions: ActionItem[] = [
    {
      title: "Add New Client",
      description: "Register and onboard a new client",
      icon: Users,
      href: "/clients/new",
      color: "bg-blue-500 hover:bg-blue-600",
      badge: "Popular"
    },
    {
      title: "Create Case",
      description: "Start a new legal case",
      icon: Briefcase,
      href: "/cases/new",
      color: "bg-purple-500 hover:bg-purple-600",
      priority: "high"
    },
    {
      title: "Schedule Meeting",
      description: "Book client consultation",
      icon: Calendar,
      href: "/calendar/new",
      color: "bg-orange-500 hover:bg-orange-600",
      badge: "Urgent"
    },
    {
      title: "Add Attorney",
      description: "Invite new team member",
      icon: User,
      href: "/attorneys/new",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Upload Document",
      description: "Add case documents",
      icon: FileText,
      href: "/documents/new",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Create Invoice",
      description: "Generate client billing",
      icon: DollarSign,
      href: "/billing/new",
      color: "bg-yellow-500 hover:bg-yellow-600",
      priority: "medium"
    },
    {
      title: "Send Message",
      description: "Contact client or attorney",
      icon: MessageSquare,
      href: "/messages/new",
      color: "bg-pink-500 hover:bg-pink-600"
    }
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <Plus className="mr-2 h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="w-full h-auto p-4 justify-start hover:shadow-md transition-all duration-200 group border-gray-200 hover:border-primary/50"
                asChild
              >
                <a href={action.href} className="flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {action.title}
                      </p>
                      {(action.badge || action.priority) && (
                        <Badge 
                          variant="secondary" 
                          className={action.priority ? getPriorityColor(action.priority) : "bg-blue-100 text-blue-800"}
                        >
                          {action.badge || action.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </a>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
