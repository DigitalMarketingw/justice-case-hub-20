
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
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:text-gray-800 hover:bg-gray-100"
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
