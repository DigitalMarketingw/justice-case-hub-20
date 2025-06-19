
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, profile, loading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - State:', {
    isAuthenticated,
    profile: profile?.role,
    user: user?.email,
    loading,
    allowedRoles,
    currentPath: location.pathname
  });

  // Show loading state while auth is being determined
  if (loading) {
    console.log('ProtectedRoute - Showing loading state');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-lg text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If specific roles are required and user has a profile, check role
  if (allowedRoles && profile) {
    if (!allowedRoles.includes(profile.role)) {
      console.log('ProtectedRoute - User role not allowed, redirecting based on role');
      
      // Prevent redirect loops by checking current path
      const redirectMap: Record<UserRole, string> = {
        "super_admin": "/super-admin",
        "firm_admin": "/firm-admin",
        "case_manager": "/case-manager",
        "attorney": "/attorney", 
        "client": "/client"
      };
      
      const redirectPath = redirectMap[profile.role];
      
      // If we're already on the correct path, don't redirect
      if (location.pathname === redirectPath) {
        console.log('ProtectedRoute - Already on correct path, allowing access');
        return <>{children}</>;
      }
      
      console.log('ProtectedRoute - Redirecting to:', redirectPath);
      return <Navigate to={redirectPath || "/attorney"} replace />;
    }
  }

  // Special handling for users without profiles or with unspecified roles
  if (isAuthenticated && user && !profile) {
    console.log('ProtectedRoute - No profile yet, showing loading');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-lg text-gray-600 mt-4">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized - allow access
  console.log('ProtectedRoute - Access granted, rendering children');
  return <>{children}</>;
};
