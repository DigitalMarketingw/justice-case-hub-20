
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

interface ClientsStatsProps {
  totalClients: number;
  activeClients: number;
  droppedClients: number;
}

export function ClientsStats({ totalClients, activeClients, droppedClients }: ClientsStatsProps) {
  const retentionRate = totalClients > 0 ? ((activeClients / totalClients) * 100).toFixed(1) : 0;

  const stats = [
    {
      title: "Total Clients",
      value: totalClients.toString(),
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Clients",
      value: activeClients.toString(),
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Dropped Clients",
      value: droppedClients.toString(),
      icon: UserX,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Retention Rate",
      value: `${retentionRate}%`,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
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
