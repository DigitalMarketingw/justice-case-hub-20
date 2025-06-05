
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LandingNavigation from "@/components/landing/LandingNavigation";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  const { isAuthenticated, profile, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their role-specific dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user && profile) {
      console.log('Index: User is authenticated, profile role:', profile.role);
      
      const redirectMap = {
        "super_admin": "/super-admin",
        "firm_admin": "/firm-admin", 
        "attorney": "/attorney",
        "client": "/client"
      };
      
      const redirectPath = redirectMap[profile.role];
      if (redirectPath) {
        console.log('Redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        // Fallback to attorney dashboard for unknown roles
        console.log('Unknown role, redirecting to attorney dashboard');
        navigate("/attorney", { replace: true });
      }
    }
  }, [isAuthenticated, profile, user, loading, navigate]);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show brief loading until redirect happens
  if (isAuthenticated && user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <LandingNavigation onLoginClick={handleLoginClick} />
      <HeroSection onLoginClick={handleLoginClick} />
      <FeaturesSection />
      <BenefitsSection onLoginClick={handleLoginClick} />
      <LandingFooter />
    </div>
  );
};

export default Index;
