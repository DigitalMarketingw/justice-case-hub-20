
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If specific roles are required and user doesn't have one of them
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

  // User is authenticated - allow access regardless of profile loading status
  console.log('ProtectedRoute - Access granted, rendering children');
  return <>{children}</>;
};
