
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

  // If authenticated but no profile yet, redirect to a safe dashboard
  if (isAuthenticated && user && !profile) {
    navigate("/auth");
    return null;
  }

  // If they're authenticated with profile, show loading until redirect happens
  if (isAuthenticated && user && profile) {
    return <div className="flex h-screen items-center justify-center">Redirecting to your dashboard...</div>;
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
