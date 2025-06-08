
import { useAuth } from "@/contexts/AuthContext";
import { 
  superAdminNavigation, 
  firmAdminNavigation, 
  attorneyNavigation, 
  clientNavigation,
  NavigationItem
} from "./NavigationConfig";

interface NavigationResult {
  navigation: NavigationItem[];
  roleLabel: string;
}

export function useNavigationConfig(): NavigationResult {
  const { user, profile } = useAuth();

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
}
