
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {!isCollapsed && (
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/corbeen logo powered by mynx softwares blue.png" 
            alt="LAWerp500 Logo" 
            className="h-14 w-auto"
          />
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </Button>
    </div>
  );
}
