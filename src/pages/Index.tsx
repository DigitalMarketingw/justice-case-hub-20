
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  Shield,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Clock
} from "lucide-react";

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
      {/* Navigation Header */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">JusticeHub</span>
          </div>
          <Button 
            onClick={handleLoginClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Login / Register
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-400/30">
                Complete Law Firm Management
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Streamline Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Legal Practice</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Comprehensive case management, client relations, and billing solutions 
                designed specifically for modern law firms. Increase efficiency and grow your practice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLoginClick}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-400 text-gray-300 hover:bg-white/10 px-8 py-4 rounded-lg transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardHeader className="pb-3">
                      <Users className="h-8 w-8 text-blue-400 mb-2" />
                      <CardTitle className="text-lg">1,200+</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">Active Clients</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardHeader className="pb-3">
                      <Briefcase className="h-8 w-8 text-purple-400 mb-2" />
                      <CardTitle className="text-lg">850+</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">Cases Managed</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardHeader className="pb-3">
                      <Clock className="h-8 w-8 text-green-400 mb-2" />
                      <CardTitle className="text-lg">40%</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">Time Saved</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 text-white">
                    <CardHeader className="pb-3">
                      <DollarSign className="h-8 w-8 text-yellow-400 mb-2" />
                      <CardTitle className="text-lg">$2M+</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">Revenue Tracked</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-slate-800/50 to-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything Your Law Firm Needs
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From case management to billing, we've got you covered with professional-grade tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: "Case Management",
                description: "Organize cases, track deadlines, and manage documents in one centralized platform",
                color: "text-blue-400"
              },
              {
                icon: Users,
                title: "Client Portal",
                description: "Give clients secure access to their case information and important documents",
                color: "text-purple-400"
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Intelligent calendar management with conflict detection and automated reminders",
                color: "text-green-400"
              },
              {
                icon: DollarSign,
                title: "Billing & Invoicing",
                description: "Track billable hours, generate invoices, and manage payments seamlessly",
                color: "text-yellow-400"
              },
              {
                icon: FileText,
                title: "Document Management",
                description: "Secure document storage with version control and collaboration features",
                color: "text-red-400"
              },
              {
                icon: Shield,
                title: "Security & Compliance",
                description: "Bank-level security with role-based access and audit trails",
                color: "text-indigo-400"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <CardHeader>
                  <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">
                Why Law Firms Choose JusticeHub
              </h2>
              <div className="space-y-6">
                {[
                  "Increase billable hour tracking accuracy by 95%",
                  "Reduce administrative tasks by 40%",
                  "Improve client satisfaction with real-time updates",
                  "Ensure compliance with built-in security features",
                  "Scale your practice with unlimited user support"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
              <Card className="relative bg-white/10 backdrop-blur-lg border-white/20 text-white p-8">
                <CardHeader>
                  <CardTitle className="text-2xl mb-4">Ready to Transform Your Practice?</CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    Join hundreds of law firms already using JusticeHub to streamline their operations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleLoginClick}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-center text-gray-400 text-sm mt-4">
                    No credit card required • 30-day free trial
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scale className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">JusticeHub</span>
          </div>
          <p className="text-gray-400">
            © 2024 JusticeHub. All rights reserved. Empowering law firms worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
