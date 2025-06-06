
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
    console.log('Index useEffect - Auth state:', {
      loading,
      isAuthenticated,
      user: user?.email,
      profile: profile?.role
    });

    if (!loading && isAuthenticated && user) {
      console.log('User is authenticated, checking profile...');
      
      if (profile) {
        console.log('Profile found, redirecting based on role:', profile.role);
        
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
      } else {
        console.log('No profile yet, waiting...');
        // If user is authenticated but profile is still loading, wait a bit more
        // This handles the case where the profile fetch is still in progress
      }
    }
  }, [isAuthenticated, profile, user, loading, navigate]);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  // Show loading while checking auth state
  if (loading) {
    console.log('Index - Showing loading state (auth loading)');
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated but no profile yet, show loading
  if (isAuthenticated && user && !profile) {
    console.log('Index - Showing loading state (waiting for profile)');
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If authenticated with profile, show brief loading until redirect happens
  if (isAuthenticated && user && profile) {
    console.log('Index - Showing loading state (redirecting)');
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
  console.log('Index - Showing landing page (not authenticated)');
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
