
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their role-specific dashboard
  useEffect(() => {
    if (isAuthenticated && profile) {
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
          // Stay on index page
          break;
      }
    }
  }, [isAuthenticated, profile, navigate]);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  // If they're already authenticated, just show a loading state until the redirect happens
  if (isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">Redirecting to your dashboard...</div>;
  }

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
