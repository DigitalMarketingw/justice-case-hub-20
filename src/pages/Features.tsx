
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  Shield,
  Clock,
  Gavel,
  Search,
  MessageSquare,
  Building,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingNavigation from "@/components/landing/LandingNavigation";
import LandingFooter from "@/components/landing/LandingFooter";

const Features = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const handleContactClick = () => {
    navigate("/contact");
  };

  const featureCategories = [
    {
      title: "Case Management",
      description: "Complete case lifecycle management with automation",
      features: [
        {
          icon: Briefcase,
          title: "Advanced Case Tracking",
          description: "Comprehensive case management with automated deadlines, document organization, and team collaboration.",
          benefits: ["Automated deadlines", "Document version control", "Team collaboration"]
        },
        {
          icon: Clock,
          title: "Time Tracking",
          description: "Precise billable hour tracking with automatic timers and detailed reporting.",
          benefits: ["Automatic timers", "Billable hour tracking", "Detailed reports"]
        },
        {
          icon: Gavel,
          title: "Court Integration",
          description: "Direct integration with court filing systems and electronic discovery tools.",
          benefits: ["E-filing support", "Court calendar sync", "Discovery tools"]
        }
      ]
    },
    {
      title: "Client Relations",
      description: "Enhanced client communication and portal access",
      features: [
        {
          icon: Users,
          title: "Client Portal",
          description: "Secure client access with real-time case updates and document sharing.",
          benefits: ["Secure access", "Real-time updates", "Document sharing"]
        },
        {
          icon: MessageSquare,
          title: "Communication Hub",
          description: "Centralized messaging system with encryption and privilege protection.",
          benefits: ["Encrypted messaging", "Privilege protection", "Message history"]
        },
        {
          icon: Award,
          title: "Client Satisfaction",
          description: "Tools to measure and improve client satisfaction and retention.",
          benefits: ["Satisfaction surveys", "Retention metrics", "Feedback system"]
        }
      ]
    },
    {
      title: "Operations & Billing",
      description: "Streamlined operations and financial management",
      features: [
        {
          icon: DollarSign,
          title: "Advanced Billing",
          description: "LEDES billing format support with automated invoicing and financial reporting.",
          benefits: ["LEDES format", "Automated invoicing", "Financial analytics"]
        },
        {
          icon: Calendar,
          title: "Smart Scheduling",
          description: "Intelligent calendar with conflict detection and automated reminders.",
          benefits: ["Conflict detection", "Smart reminders", "Calendar integration"]
        },
        {
          icon: Building,
          title: "Firm Management",
          description: "Multi-location firm management with role-based access and reporting.",
          benefits: ["Multi-location support", "Role-based access", "Performance reports"]
        }
      ]
    },
    {
      title: "Security & Compliance",
      description: "Enterprise-grade security and legal compliance",
      features: [
        {
          icon: Shield,
          title: "Security & Ethics",
          description: "ABA-compliant security with role-based access and audit trails.",
          benefits: ["ABA compliance", "Audit trails", "Role-based access"]
        },
        {
          icon: FileText,
          title: "Document Management",
          description: "Enterprise document storage with legal templates and e-signature integration.",
          benefits: ["Legal templates", "E-signature ready", "Compliance tracking"]
        },
        {
          icon: Search,
          title: "AI Legal Research",
          description: "Integrated legal research with case law search and citation checking.",
          benefits: ["Case law search", "Citation checking", "Brief analysis"]
        }
      ]
    }
  ];

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
        
        <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 text-primary-200 border-primary-200/30">
              Complete Feature Overview
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Everything Your Law Firm
              <span className="block text-primary-300">Needs to Succeed</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive legal practice management with advanced features designed specifically 
              for modern law firms of all sizes.
            </p>
          </div>
        </section>

        {/* Feature Categories */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto space-y-20">
            {featureCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-12">
                <div className="text-center">
                  <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                    {category.title}
                  </h2>
                  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    {category.description}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.features.map((feature, featureIndex) => (
                    <Card 
                      key={featureIndex}
                      className="group bg-card/10 backdrop-blur-sm border-border/20 hover:bg-card/20 hover:border-primary-400/30 transition-all duration-500 hover:scale-105"
                    >
                      <CardHeader className="space-y-4">
                        <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-400/20 w-fit group-hover:bg-primary-500/20 transition-colors">
                          <feature.icon className="h-7 w-7 text-primary-300 group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-xl font-display text-white group-hover:text-primary-300 transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription className="text-slate-300 leading-relaxed">
                          {feature.description}
                        </CardDescription>
                        <div className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-center space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                              <span className="text-slate-400">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              See how these features work together to streamline your law firm's operations 
              and enhance client satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleContactClick}
                size="lg" 
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Schedule Demo
              </Button>
              <Button 
                onClick={() => navigate("/pricing")}
                variant="outline" 
                size="lg"
                className="border-primary-400/30 text-primary-300 hover:bg-primary-500/10"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </section>
      </main>

        <LandingFooter />
      </div>
    </div>
  );
};

export default Features;
