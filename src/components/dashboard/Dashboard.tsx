
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Briefcase, Calendar, Plus, TrendingUp } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

export function Dashboard() {
  const stats = [
    {
      title: "Total Clients",
      value: "248",
      change: "+12%",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Active Cases",
      value: "67",
      change: "+5%",
      trend: "up" as const,
      icon: Briefcase,
    },
    {
      title: "Attorneys",
      value: "12",
      change: "0%",
      trend: "neutral" as const,
      icon: User,
    },
    {
      title: "This Month Revenue",
      value: "$94,500",
      change: "+18%",
      trend: "up" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your firm.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
