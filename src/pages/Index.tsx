
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
      console.log('Index: Redirecting user with profile to role dashboard:', profile.role);
      
      // Use setTimeout to ensure the redirect happens after the current render cycle
      setTimeout(() => {
        switch (profile.role) {
          case "super_admin":
            navigate("/super-admin", { replace: true });
            break;
          case "firm_admin":
            navigate("/firm-admin", { replace: true });
            break;
          case "attorney":
            navigate("/attorney", { replace: true });
            break;
          case "client":
            navigate("/client", { replace: true });
            break;
          default:
            console.log('Unknown role, staying on landing page');
            break;
        }
      }, 100);
    }
  }, [isAuthenticated, profile, user, loading, navigate]);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  // Show loading while checking auth state
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If authenticated but no profile yet, redirect to auth to handle profile creation
  if (isAuthenticated && user && !profile) {
    console.log('User authenticated but no profile, redirecting to auth');
    navigate("/auth", { replace: true });
    return <div className="flex h-screen items-center justify-center">Setting up your profile...</div>;
  }

  // If they're authenticated with profile, show brief loading until redirect happens
  if (isAuthenticated && user && profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Redirecting to your dashboard...</p>
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
