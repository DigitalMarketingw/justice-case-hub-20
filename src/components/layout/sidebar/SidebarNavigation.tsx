
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavigationItem } from "./NavigationConfig";

interface SidebarNavigationProps {
  navigation: NavigationItem[];
  isCollapsed: boolean;
}

export function SidebarNavigation({ navigation, isCollapsed }: SidebarNavigationProps) {
  const location = useLocation();

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {!isCollapsed && item.name}
          </Link>
        );
      })}
    </nav>
  );
}
