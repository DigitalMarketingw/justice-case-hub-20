
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Briefcase, Calendar, Plus, TrendingUp, DollarSign, FileText } from "lucide-react";
import { EnhancedStatsCard } from "./EnhancedStatsCard";
import { ActivityTimeline } from "./ActivityTimeline";
import { EnhancedQuickActions } from "./EnhancedQuickActions";
import { PerformanceMetrics } from "./PerformanceMetrics";

export function EnhancedDashboard() {
  const stats = [
    {
      title: "Total Clients",
      value: "248",
      change: "+12% from last month",
      trend: "up" as const,
      icon: Users,
      description: "Active clients",
      variant: "default" as const
    },
    {
      title: "Active Cases",
      value: "67",
      change: "+5% from last month",
      trend: "up" as const,
      icon: Briefcase,
      description: "In progress",
      variant: "gradient" as const
    },
    {
      title: "Team Members",
      value: "12",
      change: "No change",
      trend: "neutral" as const,
      icon: User,
      description: "Attorneys & staff",
      variant: "default" as const
    },
    {
      title: "Monthly Revenue",
      value: "$94,500",
      change: "+18% from last month",
      trend: "up" as const,
      icon: DollarSign,
      description: "This month",
      variant: "glass" as const
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back! Here's what's happening at your firm.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Quick Add
        </Button>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <EnhancedStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Timeline - Takes up 5 columns */}
        <div className="lg:col-span-5">
          <ActivityTimeline />
        </div>

        {/* Quick Actions - Takes up 3 columns */}
        <div className="lg:col-span-3">
          <EnhancedQuickActions />
        </div>

        {/* Performance Metrics - Takes up 4 columns */}
        <div className="lg:col-span-4">
          <PerformanceMetrics />
        </div>
      </div>

      {/* Additional Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { case: "Smith vs. ABC Corp", deadline: "Tomorrow", type: "Discovery Deadline", priority: "high" },
              { case: "Johnson Family Trust", deadline: "Dec 15", type: "Court Filing", priority: "medium" },
              { case: "Wilson Contract Review", deadline: "Dec 20", type: "Client Review", priority: "low" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{item.case}</p>
                  <p className="text-sm text-gray-600">{item.type}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-gray-900">{item.deadline}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Settlement Agreement - Smith Case", uploaded: "2 hours ago", size: "2.4 MB" },
              { name: "Contract Amendment - Johnson", uploaded: "1 day ago", size: "1.8 MB" },
              { name: "Discovery Motion - Wilson", uploaded: "2 days ago", size: "3.2 MB" }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.uploaded} • {doc.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
