
import { memo, useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { EnhancedStatsCard } from "./EnhancedStatsCard";
import { StatsCardSkeleton } from "./StatsCardSkeleton";
import { ActivityTimeline } from "./ActivityTimeline";
import { EnhancedQuickActions } from "./EnhancedQuickActions";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { Users, FileText, Calendar, DollarSign } from "lucide-react";

const MemoizedStatsCard = memo(EnhancedStatsCard);
const MemoizedActivityTimeline = memo(ActivityTimeline);
const MemoizedQuickActions = memo(EnhancedQuickActions);
const MemoizedPerformanceMetrics = memo(PerformanceMetrics);

export const EnhancedDashboard = memo(function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCases: 0,
    upcomingEvents: 0,
    monthlyRevenue: 0
  });

  usePerformanceMonitor('EnhancedDashboard');

  useEffect(() => {
    // Simulate loading delay and then set mock data
    const timer = setTimeout(() => {
      setStats({
        totalClients: 127,
        activeCases: 45,
        upcomingEvents: 8,
        monthlyRevenue: 85000
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back! Here's an overview of your practice.
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))
          ) : (
            <>
              <MemoizedStatsCard
                title="Total Clients"
                value={stats.totalClients.toString()}
                change="+5% from last month"
                trend="up"
                icon={Users}
                description="Active clients"
              />
              <MemoizedStatsCard
                title="Active Cases"
                value={stats.activeCases.toString()}
                change="+2% from last month"
                trend="up"
                icon={FileText}
                variant="gradient"
                description="In progress"
              />
              <MemoizedStatsCard
                title="Upcoming Events"
                value={stats.upcomingEvents.toString()}
                change="No change"
                trend="neutral"
                icon={Calendar}
                description="This week"
              />
              <MemoizedStatsCard
                title="Monthly Revenue"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                change="+12% from last month"
                trend="up"
                icon={DollarSign}
                variant="glass"
                description="This month"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <MemoizedActivityTimeline />
          </div>
          <div className="md:col-span-3">
            <MemoizedQuickActions />
          </div>
          <div className="md:col-span-4">
            <MemoizedPerformanceMetrics />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});
