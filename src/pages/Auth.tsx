
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const Auth = () => {
  const { signIn, isAuthenticated, profile, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasWaitedForProfile, setHasWaitedForProfile] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Demo credentials for each role
  const demoCredentials = [
    {
      role: "Super Admin",
      email: "superadmin@demo.com",
      password: "demo123",
      description: "Full system access"
    },
    {
      role: "Firm Admin",
      email: "firmadmin@demo.com", 
      password: "demo123",
      description: "Manage firm and users"
    },
    {
      role: "Attorney",
      email: "attorney@demo.com",
      password: "demo123", 
      description: "Handle cases and clients"
    },
    {
      role: "Client",
      email: "client@demo.com",
      password: "demo123",
      description: "View case information"
    }
  ];

  // Wait for profile to load before redirecting
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      const timer = setTimeout(() => {
        setHasWaitedForProfile(true);
      }, 2000); // Wait 2 seconds for profile to load

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, loading]);

  // Debug logging
  useEffect(() => {
    console.log('Auth page state:', {
      isAuthenticated,
      profile,
      user: user?.email,
      loading,
      hasWaitedForProfile
    });
  }, [isAuthenticated, profile, user, loading, hasWaitedForProfile]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated and we have a profile, redirect
  if (isAuthenticated && user && profile) {
    console.log('Redirecting based on profile role:', profile.role);
    switch (profile.role) {
      case "super_admin":
        return <Navigate to="/super-admin" replace />;
      case "firm_admin":
        return <Navigate to="/firm-admin" replace />;
      case "attorney":
        return <Navigate to="/attorney" replace />;
      case "client":
        return <Navigate to="/client" replace />;
      default:
        return <Navigate to="/attorney" replace />;
    }
  }

  // If authenticated but no profile after waiting, redirect to attorney dashboard
  if (isAuthenticated && user && !profile && hasWaitedForProfile) {
    console.log('User authenticated but no profile after waiting, redirecting to attorney dashboard');
    return <Navigate to="/attorney" replace />;
  }

  // If authenticated but still waiting for profile
  if (isAuthenticated && user && !hasWaitedForProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Setting up your profile...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Attempting login with:', loginEmail);
    const result = await signIn(loginEmail, loginPassword);
    console.log('Login result:', result);
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setLoginEmail(email);
    setLoginPassword(password);
    
    console.log('Attempting demo login with:', email);
    const result = await signIn(email, password);
    console.log('Demo login result:', result);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Law Firm Management</CardTitle>
            <CardDescription>Login to access your dashboard</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Demo Credentials</CardTitle>
            <CardDescription>Click any credential below to login with that role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div 
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleDemoLogin(cred.email, cred.password)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{cred.role}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{cred.description}</p>
                    <p className="text-xs text-gray-500">{cred.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" disabled={isLoading}>
                    Login
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
