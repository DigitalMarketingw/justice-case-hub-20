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
  Building
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
  { name: 'Settings', href: '/settings', icon: Settings },
];

const firmAdminNavigation = [
  { name: 'Dashboard', href: '/firm-admin', icon: Home },
  { name: 'Firms', href: '/firms', icon: Building },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Attorneys', href: '/attorneys', icon: User },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const attorneyNavigation = [
  { name: 'Dashboard', href: '/attorney', icon: Home },
  { name: 'Firms', href: '/firms', icon: Building },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const clientNavigation = [
  { name: 'Dashboard', href: '/client', icon: Home },
  { name: 'Firms', href: '/firms', icon: Building },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, profile, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error('Error signing out:', error);
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

  // Choose navigation based on user role
  const getNavigationForRole = () => {
    switch (profile?.role) {
      case 'super_admin':
        return superAdminNavigation;
      case 'firm_admin':
        return firmAdminNavigation;
      case 'attorney':
        return attorneyNavigation;
      case 'client':
        return clientNavigation;
      default:
        return attorneyNavigation;
    }
  };

  const navigation = getNavigationForRole();

  return (
    <div className={cn(
      "flex flex-col bg-slate-900 text-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold">
            {profile?.role === 'super_admin' ? 'Super Admin' : 
             profile?.role === 'firm_admin' ? 'Firm Admin' :
             profile?.role === 'attorney' ? 'Attorney' :
             profile?.role === 'client' ? 'Client Portal' :
             'LawFirm ERP'}
          </h1>
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
                {profile?.role === 'super_admin' ? 'Super Admin' : 
                 profile?.role === 'firm_admin' ? 'Firm Admin' :
                 profile?.role === 'attorney' ? 'Attorney' :
                 profile?.role === 'client' ? 'Client' :
                 'User'}
              </p>
            </div>
          )}
        </div>
        
        {/* Logout Button */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && "Sign Out"}
          </Button>
        )}
      </div>
    </div>
  );
}
