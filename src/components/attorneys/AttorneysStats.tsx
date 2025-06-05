
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Building, TrendingUp } from "lucide-react";

interface AttorneysStatsProps {
  totalAttorneys: number;
  avgExperience: number;
}

export function AttorneysStats({ totalAttorneys, avgExperience }: AttorneysStatsProps) {
  const stats = [
    {
      title: "Total Attorneys",
      value: totalAttorneys.toString(),
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Avg Experience",
      value: `${avgExperience} years`,
      icon: Award,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Practice Areas",
      value: "8",
      icon: Building,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Success Rate",
      value: "94%",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
