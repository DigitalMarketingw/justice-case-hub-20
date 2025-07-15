
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
  variant?: "default" | "gradient" | "glass";
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  className,
  variant = "default"
}: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getCardVariant = () => {
    switch (variant) {
      case "gradient":
        return "gradient-primary text-primary-foreground shadow-xl";
      case "glass":
        return "bg-card/80 backdrop-blur-lg shadow-lg";
      default:
        return "bg-card shadow-md";
    }
  };

  return (
    <Card className={cn(
      "transition-smooth hover:shadow-lg hover:scale-[1.02] cursor-pointer",
      getCardVariant(),
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium tracking-wide uppercase",
              variant === "gradient" ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <div className="mt-2">
              <p className={cn(
                "text-3xl font-bold tracking-tight font-display",
                variant === "gradient" ? "text-primary-foreground" : "text-foreground"
              )}>
                {value}
              </p>
              <p className={cn(
                "text-sm font-medium mt-1",
                variant === "gradient" ? "text-primary-foreground/70" : getTrendColor()
              )}>
                {change} from last month
              </p>
            </div>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center transition-smooth",
            variant === "gradient" 
              ? "bg-white/20 backdrop-blur-sm" 
              : "bg-primary/10 hover:bg-primary/20"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === "gradient" ? "text-primary-foreground" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
