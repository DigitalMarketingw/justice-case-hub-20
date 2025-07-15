
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
          "case_manager": "/case-manager",
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
        // If authenticated but no profile, wait a bit longer before fallback
        console.log('No profile yet, setting timeout for fallback redirect');
        const timer = setTimeout(() => {
          if (isAuthenticated && user && !profile) {
            console.log('Profile still not loaded, redirecting to attorney dashboard as fallback');
            navigate("/attorney", { replace: true });
          }
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, profile, user, loading, navigate]);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const handleContactClick = () => {
    navigate("/contact");
  };

  // Show loading while checking auth state
  if (loading) {
    console.log('Index - Showing loading state (auth loading)');
    return (
      <div className="flex h-screen items-center justify-center"
           style={{
           backgroundImage: 'url(/lovable-uploads/5d01f912-00ca-4a68-9268-3100775217e8.png)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="text-center text-white relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  console.log('Index - Showing landing page (not authenticated)');
  return (
    <div className="min-h-screen" 
         style={{
           backgroundImage: 'url(/lovable-uploads/5d01f912-00ca-4a68-9268-3100775217e8.png)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <LandingNavigation onLoginClick={handleLoginClick} onContactClick={handleContactClick} />
        <HeroSection onContactClick={handleContactClick} />
        <FeaturesSection />
        <BenefitsSection onLoginClick={handleLoginClick} />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
