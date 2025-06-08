
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Home, 
  Users, 
  User, 
  Briefcase, 
  Calendar, 
  Settings,
  CreditCard,
  FileText,
  Menu,
  X,
  LogOut,
  Building,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

const superAdminNavigation = [
  { name: 'Dashboard', href: '/super-admin', icon: Home },
  { name: 'Firms', href: '/firms', icon: Building },
  { name: 'Attorneys', href: '/attorneys', icon: User },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const firmAdminNavigation = [
  { name: 'Dashboard', href: '/firm-admin', icon: Home },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Attorneys', href: '/attorneys', icon: User },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const attorneyNavigation = [
  { name: 'Dashboard', href: '/attorney', icon: Home },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const clientNavigation = [
  { name: 'Dashboard', href: '/client', icon: Home },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, profile, loading } = useAuth();

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    console.log('Sidebar: Starting EMERGENCY logout process');
    
    try {
      await signOut();
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

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className={cn(
        "flex flex-col bg-slate-900 text-white w-64",
        className
      )}>
        <div className="p-4 border-b border-slate-700">
          <div className="h-6 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Determine navigation and role based on profile and user
  const getNavigationAndRole = () => {
    console.log('Sidebar - determining navigation for:', {
      userEmail: user?.email,
      profileRole: profile?.role,
      profile: profile
    });

    // Special case for superadmin@demo.com - always show super admin navigation
    if (user?.email === 'superadmin@demo.com') {
      console.log('Sidebar - Using super admin navigation for superadmin@demo.com');
      return {
        navigation: superAdminNavigation,
        roleLabel: 'Super Admin'
      };
    }
    
    // For other users, use their profile role with fallback
    const userRole = profile?.role || 'attorney';
    console.log('Sidebar - Using profile role:', userRole);
    
    switch (userRole) {
      case 'super_admin':
        return {
          navigation: superAdminNavigation,
          roleLabel: 'Super Admin'
        };
      case 'firm_admin':
        return {
          navigation: firmAdminNavigation,
          roleLabel: 'Firm Admin'
        };
      case 'attorney':
        return {
          navigation: attorneyNavigation,
          roleLabel: 'Attorney'
        };
      case 'client':
        return {
          navigation: clientNavigation,
          roleLabel: 'Client'
        };
      default:
        return {
          navigation: attorneyNavigation,
          roleLabel: 'User'
        };
    }
  };

  const { navigation, roleLabel } = getNavigationAndRole();

  return (
    <div className={cn(
      "flex flex-col bg-slate-900 text-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/bbf7762d-182e-48ac-b791-d3c06762a94c.png" 
              alt="LAWerp500 Logo" 
              className="h-6 w-auto"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-slate-800"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      {/* Navigation */}
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

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        {/* User Info */}
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
            <User size={16} />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : user?.email ? user.email.split('@')[0] : 'User'}
              </p>
              <p className="text-xs text-slate-400">
                {roleLabel}
              </p>
            </div>
          )}
        </div>
        
        {/* EMERGENCY Logout Button */}
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
      </div>
    </div>
  );
}
