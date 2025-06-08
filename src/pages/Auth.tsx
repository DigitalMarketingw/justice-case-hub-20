
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
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      showOnboarding
    });
  }, [isAuthenticated, profile, user, loading, showOnboarding]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated and we have a profile, check if onboarding should be shown
  if (isAuthenticated && user && profile) {
    if (showOnboarding || (!profile.last_login && authMode !== "onboarding")) {
      return (
        <OnboardingFlow
          userRole={profile.role}
          onComplete={() => {
            setShowOnboarding(false);
            // Redirect to appropriate dashboard
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

    console.log('Auth: Redirecting based on profile role:', profile.role);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <img 
              src="/lovable-uploads/bbf7762d-182e-48ac-b791-d3c06762a94c.png" 
              alt="LAWerp500 Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">LAWerp500</h1>
            <p className="text-gray-600">Legal Practice Management Suite</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Demo Access</h3>
              <p className="text-sm text-gray-600 mb-4">
                Try LAWerp500 instantly with these demo accounts
              </p>
            </div>

            <div className="grid gap-3">
              {demoCredentials.map((cred, index) => (
                <div 
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
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
                        <Badge variant="outline" className="text-xs">
                          {cred.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{cred.description}</p>
                      <p className="text-xs text-gray-500 font-mono">{cred.email}</p>
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-600">
                      Click to copy
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Demo Users Button */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateDemo(!showCreateDemo)}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
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
