
import { User } from "lucide-react";

interface SidebarUserInfoProps {
  isCollapsed: boolean;
  displayName: string;
  roleLabel: string;
}

export function SidebarUserInfo({ isCollapsed, displayName, roleLabel }: SidebarUserInfoProps) {
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
        <User size={16} className="text-white" />
      </div>
      {!isCollapsed && (
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">{displayName}</p>
          <p className="text-xs text-gray-600">{roleLabel}</p>
        </div>
      )}
    </div>
  );
}
