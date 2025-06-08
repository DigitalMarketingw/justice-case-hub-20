
import { User } from "lucide-react";

interface SidebarUserInfoProps {
  isCollapsed: boolean;
  displayName: string;
  roleLabel: string;
}

export function SidebarUserInfo({ isCollapsed, displayName, roleLabel }: SidebarUserInfoProps) {
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
        <User size={16} />
      </div>
      {!isCollapsed && (
        <div className="ml-3">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-slate-400">{roleLabel}</p>
        </div>
      )}
    </div>
  );
}
