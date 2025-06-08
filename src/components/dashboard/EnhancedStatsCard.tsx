
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedStatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
  variant?: "default" | "gradient" | "glass";
  description?: string;
}

export function EnhancedStatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  className,
  variant = "default",
  description
}: EnhancedStatsCardProps) {
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
        return "gradient-primary text-primary-foreground border-0 shadow-xl";
      case "glass":
        return "glass-effect border-white/20 backdrop-blur-lg bg-white/10";
      default:
        return "bg-card border hover:shadow-lg";
    }
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "→";
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:scale-[1.02] cursor-pointer group",
      getCardVariant(),
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <p className={cn(
                "text-sm font-medium tracking-wide",
                variant === "gradient" ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {title}
              </p>
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                variant === "gradient" 
                  ? "bg-white/20 backdrop-blur-sm" 
                  : "bg-primary/10 group-hover:bg-primary/20"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  variant === "gradient" ? "text-primary-foreground" : "text-primary"
                )} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className={cn(
                "text-3xl font-bold tracking-tight font-display",
                variant === "gradient" ? "text-primary-foreground" : "text-foreground"
              )}>
                {value}
              </p>
              
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-sm font-semibold flex items-center",
                  variant === "gradient" ? "text-primary-foreground/90" : getTrendColor()
                )}>
                  {getTrendIcon()} {change}
                </span>
                {description && (
                  <span className={cn(
                    "text-xs",
                    variant === "gradient" ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {description}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
