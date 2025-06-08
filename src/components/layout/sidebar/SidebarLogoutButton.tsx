
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLogoutButtonProps {
  isCollapsed: boolean;
  onSignOut: () => Promise<void>;
}

export function SidebarLogoutButton({ isCollapsed, onSignOut }: SidebarLogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    console.log('Sidebar: Starting EMERGENCY logout process');
    
    try {
      await onSignOut();
      setTimeout(() => {
        if (window.location.pathname !== '/auth') {
          console.log('Sidebar: Forcing navigation to auth page');
          window.location.href = '/auth';
        }
      }, 100);
      
    } catch (error) {
      console.error('Sidebar: Error during logout (forcing logout anyway):', error);
      window.location.href = '/auth';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoggingOut}
      className="w-full justify-start text-slate-300 hover:bg-red-800 hover:text-white disabled:opacity-50 bg-red-900/20 border border-red-800"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {!isCollapsed && (isLoggingOut ? "LOGGING OUT..." : "EMERGENCY LOGOUT")}
    </Button>
  );
}
