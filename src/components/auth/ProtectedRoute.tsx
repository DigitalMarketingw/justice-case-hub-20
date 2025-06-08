
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, profile, loading, user } = useAuth();

  console.log('ProtectedRoute - State:', {
    isAuthenticated,
    profile: profile?.role,
    user: user?.email,
    loading,
    allowedRoles
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
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    console.log('ProtectedRoute - User role not allowed, redirecting based on role');
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

  // User is authenticated - allow access (with or without profile)
  // If no profile, we'll use the fallback profile created in AuthContext
  console.log('ProtectedRoute - Access granted, rendering children');
  return <>{children}</>;
};
