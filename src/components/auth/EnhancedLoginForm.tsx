
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Lock,
  UserCheck,
  Mail
} from "lucide-react";

interface EnhancedLoginFormProps {
  onSignUpClick: () => void;
}

const EnhancedLoginForm = ({ onSignUpClick }: EnhancedLoginFormProps) => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const result = await signIn(email, password);
    
    if (result.error) {
      setError("Invalid email or password. Please try again.");
    }
    
    setIsLoading(false);
  };

  const securityFeatures = [
    "256-bit SSL encryption",
    "SOC 2 Type II compliant",
    "Multi-factor authentication",
    "Regular security audits"
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-primary-50 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display text-gray-900">
                Secure Login
              </CardTitle>
              <CardDescription className="text-gray-600">
                Access your legal practice management dashboard
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-destructive-200 bg-destructive-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="attorney@lawfirm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-primary-300 focus:ring-primary-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary-300 focus:ring-primary-100"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 w-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Sign In Securely
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <Separator className="my-6" />
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={onSignUpClick}
                  className="p-0 h-auto font-medium text-primary-600 hover:text-primary-700"
                >
                  Create account
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2 text-primary-600" />
              Your data is protected by
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                  <CheckCircle className="w-3 h-3 text-success-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLoginForm;
