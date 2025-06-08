
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Shield,
  FileText,
  Briefcase,
  Clock,
  Gavel,
  Search
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Briefcase,
      title: "Advanced Case Management",
      description: "Comprehensive case tracking with automated deadlines, document organization, and team collaboration tools built for legal workflows.",
      benefits: ["Automated deadline tracking", "Document version control", "Team collaboration"],
      color: "text-primary-500",
      badge: "Core Feature"
    },
    {
      icon: Users,
      title: "Client Relationship Hub",
      description: "Secure client portal with real-time case updates, document sharing, and communication tools that enhance client satisfaction.",
      benefits: ["Secure client portal", "Real-time updates", "Mobile access"],
      color: "text-secondary-500",
      badge: "Client Focused"
    },
    {
      icon: Calendar,
      title: "Legal Calendar & Scheduling",
      description: "Intelligent scheduling with court calendar integration, conflict detection, and automated reminders for all legal deadlines.",
      benefits: ["Court calendar sync", "Conflict detection", "Smart reminders"],
      color: "text-success-500",
      badge: "Time Management"
    },
    {
      icon: DollarSign,
      title: "Advanced Billing & Time Tracking",
      description: "Precise time tracking with LEDES billing format support, automated invoicing, and detailed financial reporting for law firms.",
      benefits: ["LEDES format support", "Automated invoicing", "Financial analytics"],
      color: "text-warning-500",
      badge: "Revenue Focus"
    },
    {
      icon: FileText,
      title: "Legal Document Management",
      description: "Enterprise-grade document storage with legal-specific templates, e-signature integration, and compliance tracking.",
      benefits: ["Legal templates", "E-signature ready", "Compliance tracking"],
      color: "text-destructive-500",
      badge: "Document Control"
    },
    {
      icon: Shield,
      title: "Security & Ethics Compliance",
      description: "ABA-compliant security with role-based access, audit trails, and attorney-client privilege protection built-in.",
      benefits: ["ABA compliant", "Audit trails", "Privilege protection"],
      color: "text-info-500",
      badge: "Security First"
    },
    {
      icon: Search,
      title: "AI-Powered Legal Research",
      description: "Integrated legal research tools with case law search, citation checking, and brief analysis powered by AI.",
      benefits: ["Case law search", "Citation checking", "Brief analysis"],
      color: "text-accent-500",
      badge: "AI Enhanced"
    },
    {
      icon: Clock,
      title: "Workflow Automation",
      description: "Automate routine legal tasks, document generation, and case milestone tracking to focus on high-value legal work.",
      benefits: ["Task automation", "Document generation", "Milestone tracking"],
      color: "text-primary-600",
      badge: "Efficiency"
    },
    {
      icon: Gavel,
      title: "Court Integration",
      description: "Direct integration with court filing systems, electronic discovery tools, and legal research databases.",
      benefits: ["E-filing integration", "Discovery tools", "Research databases"],
      color: "text-secondary-600",
      badge: "Court Ready"
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 text-primary-600 border-primary-200">
            Complete Legal Suite
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Everything Your Law Firm Needs
            <span className="block text-primary-500">In One Powerful Platform</span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-4xl mx-auto leading-relaxed">
            From case intake to final billing, LAWerp500 provides comprehensive tools designed specifically 
            for legal professionals. Increase efficiency, ensure compliance, and grow your practice.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group relative bg-card/50 backdrop-blur-sm border-border/20 hover:bg-card/80 hover:border-primary-200 transition-all duration-500 hover:scale-105 hover:shadow-xl"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-background/50 border border-border/20 group-hover:bg-primary-50 transition-colors`}>
                    <feature.icon className={`h-7 w-7 ${feature.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-muted/50">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-display group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-foreground/80 leading-relaxed">
                  {feature.description}
                </CardDescription>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      <span className="text-foreground/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              {/* Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-foreground/70 mb-4">
            Ready to see how these features work together?
          </p>
          <Badge variant="outline" className="text-primary-600 border-primary-200 bg-primary-50">
            Schedule a personalized demo with our legal technology experts
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
