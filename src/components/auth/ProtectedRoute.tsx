
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, profile, loading, user } = useAuth();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Special handling for superadmin@demo.com - allow access even without profile
  if (user?.email === 'superadmin@demo.com' && (!allowedRoles || allowedRoles.includes('super_admin'))) {
    console.log('Allowing superadmin access without profile check');
    return <>{children}</>;
  }

  // If specific roles are required and user doesn't have one of them
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectMap = {
      "super_admin": "/super-admin",
      "firm_admin": "/firm-admin",
      "attorney": "/attorney", 
      "client": "/client"
    };
    
    const redirectPath = redirectMap[profile.role];
    return <Navigate to={redirectPath || "/attorney"} replace />;
  }

  // If we have no profile but specific roles are required, and it's not superadmin
  if (allowedRoles && !profile && user?.email !== 'superadmin@demo.com') {
    console.log('No profile found for user, redirecting to attorney dashboard as fallback');
    return <Navigate to="/attorney" replace />;
  }

  // User is authenticated and has proper role (or is superadmin) - allow access
  return <>{children}</>;
};
