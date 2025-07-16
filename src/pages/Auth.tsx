import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { createDemoUsers } from "@/utils/createDemoUsers";
import { useToast } from "@/hooks/use-toast";
import EnhancedLoginForm from "@/components/auth/EnhancedLoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import OnboardingFlow from "@/components/auth/OnboardingFlow";

const Auth = () => {
  const { isAuthenticated, profile, user, loading } = useAuth();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"login" | "signup" | "onboarding">("login");
  const [showCreateDemo, setShowCreateDemo] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);

  // Demo credentials for each role with the specified passwords
  const demoCredentials = [
    {
      role: "Super Admin",
      email: "superadmin@demo.com",
      password: "admin123",
      description: "Full system access"
    },
    {
      role: "Firm Admin",
      email: "firmadmin@demo.com", 
      password: "admin123",
      description: "Manage firm and users"
    },
    {
      role: "Case Manager",
      email: "casemanager@demo.com",
      password: "password",
      description: "Manage clients and cases"
    },
    {
      role: "Attorney",
      email: "attorney@demo.com",
      password: "password", 
      description: "Handle cases and clients"
    },
    {
      role: "Client",
      email: "client@demo.com",
      password: "password",
      description: "View case information"
    }
  ];

  // Debug logging
  useEffect(() => {
    console.log('Auth page state:', {
      isAuthenticated,
      profile: profile?.role,
      user: user?.email,
      loading,
      profileLastLogin: profile?.last_login
    });
  }, [isAuthenticated, profile, user, loading]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" 
           style={{
             backgroundImage: 'url(/auth-gradient-bg.png)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated and we have a profile, redirect to dashboard
  if (isAuthenticated && user && profile) {
    // Skip onboarding for existing users (users with last_login set)
    // Only show onboarding for truly new users
    const isNewUser = !profile.last_login || profile.last_login === null;
    
    if (isNewUser && authMode !== "onboarding") {
      return (
        <OnboardingFlow
          userRole={profile.role}
          onComplete={() => {
            // Redirect to appropriate dashboard after onboarding
            const redirectMap = {
              "super_admin": "/super-admin",
              "firm_admin": "/firm-admin",
              "attorney": "/attorney",
              "client": "/client"
            };
            
            const redirectPath = redirectMap[profile.role] || "/attorney";
            window.location.href = redirectPath;
          }}
        />
      );
    }

    // For existing users, redirect directly to dashboard
    console.log('Auth: Redirecting existing user based on profile role:', profile.role);
    const redirectMap = {
      "super_admin": "/super-admin",
      "firm_admin": "/firm-admin",
      "attorney": "/attorney",
      "client": "/client"
    };
    
    const redirectPath = redirectMap[profile.role] || "/attorney";
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated but no profile yet, redirect to attorney dashboard as fallback
  if (isAuthenticated && user && !profile) {
    console.log('Auth: User authenticated but no profile yet, redirecting to attorney dashboard');
    return <Navigate to="/attorney" replace />;
  }

  const handleCreateDemoUsers = async () => {
    setCreatingDemo(true);
    try {
      await createDemoUsers();
      toast({
        title: "Demo users created successfully!",
        description: "You can now login with the demo credentials.",
      });
    } catch (error) {
      console.error('Error creating demo users:', error);
      toast({
        title: "Error creating demo users",
        description: "Check console for details.",
        variant: "destructive",
      });
    } finally {
      setCreatingDemo(false);
      setShowCreateDemo(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" 
         style={{
           backgroundImage: 'url(/auth-gradient-bg.png)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo Header - removed redundant text */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <img 
              src="/corbeen white.png" 
              alt="Corbeen Logo" 
              className="h-24 w-auto"
            />
          </div>
        </div>

        {/* Auth Forms */}
        {authMode === "login" && (
          <EnhancedLoginForm onSignUpClick={() => setAuthMode("signup")} />
        )}
        
        {authMode === "signup" && (
          <SignUpForm onSignInClick={() => setAuthMode("login")} />
        )}

        {/* Demo Credentials Section - Only show for login */}
        {authMode === "login" && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Demo Access</h3>
              <p className="text-sm text-white/70 mb-4">
                Try LAWerp500 instantly with these demo accounts
              </p>
            </div>

            <div className="grid gap-3">
              {demoCredentials.map((cred, index) => (
                <div 
                  key={index}
                  className="p-4 border border-white/20 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group backdrop-blur-sm"
                  onClick={() => {
                    // Auto-fill demo credentials (you could implement auto-login here)
                    toast({
                      title: `Demo credentials for ${cred.role}`,
                      description: `Email: ${cred.email} | Password: ${cred.password}`,
                    });
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-white/10 backdrop-blur-sm text-white border-white/30">
                          {cred.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/80">{cred.description}</p>
                      <p className="text-xs text-white/60 font-mono">{cred.email}</p>
                    </div>
                    <div className="text-xs text-white/50 group-hover:text-white/70">
                      Click to copy
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Demo Users Button */}
            <div className="text-center pt-4 border-t border-white/20">
              <button
                onClick={() => setShowCreateDemo(!showCreateDemo)}
                className="text-sm text-white/70 hover:text-white underline"
                disabled={creatingDemo}
              >
                {showCreateDemo ? 'Cancel' : 'Demo users not working? Create them'}
              </button>
              
              {showCreateDemo && (
                <div className="mt-3">
                  <button
                    onClick={handleCreateDemoUsers}
                    disabled={creatingDemo}
                    className="px-4 py-2 bg-success-600 text-white rounded-lg text-sm hover:bg-success-700 disabled:opacity-50"
                  >
                    {creatingDemo ? 'Creating...' : 'Create Demo Users'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
