
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createDemoUsers } from "@/utils/createDemoUsers";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { signIn, isAuthenticated, profile, user, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDemo, setShowCreateDemo] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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
      loading
    });
  }, [isAuthenticated, profile, user, loading]);

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

  // If authenticated and we have a profile, redirect to the correct dashboard
  if (isAuthenticated && user && profile) {
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
    
    if (result.error) {
      toast({
        title: "Login failed",
        description: "Demo user might not exist. Try creating demo users first.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">LAWerp500</CardTitle>
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
          <CardFooter>
            <div className="w-full space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowCreateDemo(!showCreateDemo)}
                disabled={isLoading || creatingDemo}
              >
                {showCreateDemo ? 'Cancel' : 'Need to create demo users?'}
              </Button>
              {showCreateDemo && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCreateDemoUsers}
                  disabled={isLoading || creatingDemo}
                >
                  {creatingDemo ? 'Creating Users...' : 'Create Demo Users'}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
