
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarUserInfo } from "./sidebar/SidebarUserInfo";
import { SidebarLogoutButton } from "./sidebar/SidebarLogoutButton";
import { useNavigationConfig } from "./sidebar/useNavigationConfig";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut, user, profile, loading } = useAuth();
  const { navigation, roleLabel } = useNavigationConfig();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className={cn(
        "flex flex-col bg-gray-50 text-gray-700 w-64",
        className
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email ? user.email.split('@')[0] : 'User';

  return (
    <div className={cn(
      "flex flex-col bg-gray-50 text-gray-700 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <SidebarHeader 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <SidebarNavigation 
        navigation={navigation}
        isCollapsed={isCollapsed}
      />

      <div className="p-4 border-t border-gray-200 space-y-3">
        <SidebarUserInfo 
          isCollapsed={isCollapsed}
          displayName={displayName}
          roleLabel={roleLabel}
        />
        
        <SidebarLogoutButton 
          isCollapsed={isCollapsed}
          onSignOut={signOut}
        />
      </div>
    </div>
  );
}
