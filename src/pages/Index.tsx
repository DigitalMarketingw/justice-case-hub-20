
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isAuthenticated, profile, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their role-specific dashboard
  useEffect(() => {
    if (isAuthenticated && user && profile) {
      console.log('Index: Redirecting user with profile to role dashboard:', profile.role);
      switch (profile.role) {
        case "super_admin":
          navigate("/super-admin");
          break;
        case "firm_admin":
          navigate("/firm-admin");
          break;
        case "attorney":
          navigate("/attorney");
          break;
        case "client":
          navigate("/client");
          break;
        default:
          // Stay on index page for unknown roles
          break;
      }
    }
  }, [isAuthenticated, profile, user, navigate]);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  // Show loading while checking auth state
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If authenticated but no profile yet, show a basic dashboard
  if (isAuthenticated && user && !profile) {
    console.log('Index: User authenticated but no profile, showing basic dashboard');
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <Sidebar />
          <main className="flex-1">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Welcome!</h1>
                  <p className="text-gray-600">Setting up your profile...</p>
                </div>
              </div>
              <Dashboard />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // If they're authenticated with profile, show loading until redirect happens
  if (isAuthenticated && user && profile) {
    return <div className="flex h-screen items-center justify-center">Redirecting to your dashboard...</div>;
  }

  // Not authenticated - show public landing page
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Law Firm Management System</h1>
              <Button onClick={handleLoginClick}>Login / Register</Button>
            </div>
            <Dashboard />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
