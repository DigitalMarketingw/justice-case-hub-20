
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Briefcase, Calendar, Plus } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Add New Client",
      description: "Register a new client",
      icon: Users,
      href: "/clients/new",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Add Attorney",
      description: "Add team member",
      icon: User,
      href: "/attorneys/new",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Create Case",
      description: "Start a new case",
      icon: Briefcase,
      href: "/cases/new",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Schedule Meeting",
      description: "Book an appointment",
      icon: Calendar,
      href: "/calendar/new",
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:shadow-md transition-shadow"
                asChild
              >
                <a href={action.href}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${action.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
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
