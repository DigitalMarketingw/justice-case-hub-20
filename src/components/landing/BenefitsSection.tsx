
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Mail,
  Star,
  Zap,
  Award
} from "lucide-react";

interface BenefitsSectionProps {
  onLoginClick: () => void;
}

const BenefitsSection = ({ onLoginClick }: BenefitsSectionProps) => {
  const benefits = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and ABA-approved security measures protect your sensitive client data.",
      features: ["256-bit encryption", "Two-factor authentication", "Regular security audits", "HIPAA compliance"]
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Automated time tracking, smart scheduling, and workflow optimization increase billable hours by up to 35%.",
      features: ["Automatic time capture", "Smart calendar sync", "Deadline management", "Task automation"]
    },
    {
      icon: Users,
      title: "Client Experience",
      description: "Secure client portals, automated communications, and real-time case updates enhance client satisfaction.",
      features: ["Client self-service portal", "Automated status updates", "Secure document sharing", "Mobile access"]
    },
    {
      icon: DollarSign,
      title: "Financial Control",
      description: "Comprehensive billing, expense tracking, and financial reporting provide complete practice visibility.",
      features: ["Automated invoicing", "Trust accounting", "Financial dashboards", "Payment processing"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      title: "Managing Partner",
      firm: "Chen & Associates",
      quote: "LAWerp500 transformed our practice. We've increased efficiency by 40% and our clients love the transparency.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      title: "Solo Practitioner",
      firm: "Rodriguez Law",
      quote: "As a solo attorney, LAWerp500 gives me the tools of a large firm. It's like having a full administrative team.",
      rating: 5
    }
  ];

  return (
    <section className="relative py-20 lg:py-32 px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-800/80"></div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-primary-500/10 text-primary-400 border-primary-500/20">
            <Zap className="w-3 h-3 mr-1" />
            Proven Results
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-display font-bold text-white mb-6">
            Why Leading Law Firms
            <span className="block bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Choose LAWerp500
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Join thousands of legal professionals who have transformed their practice 
            with our comprehensive management platform.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-lg border-border/20 hover:bg-card/90 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                    <benefit.icon className="h-8 w-8 text-primary-400" />
                  </div>
                  <CardTitle className="text-2xl font-display text-foreground">{benefit.title}</CardTitle>
                </div>
                <p className="text-foreground/80 leading-relaxed">{benefit.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefit.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display font-bold text-white mb-4">
              Trusted by Legal Professionals
            </h3>
            <p className="text-foreground/80">See what our clients say about their experience</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-lg border-border/20">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-foreground/80 mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t border-border/20 pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-foreground/70">{testimonial.title}</div>
                    <div className="text-sm text-primary-400">{testimonial.firm}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary-600/20 to-secondary-600/20 backdrop-blur-lg border-border/20 p-12">
            <div className="max-w-3xl mx-auto">
              <Award className="w-16 h-16 text-primary-400 mx-auto mb-6" />
              <h3 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                Ready to Transform Your Practice?
              </h3>
              <p className="text-xl text-foreground/80 mb-8">
                Join the legal technology revolution and see why LAWerp500 is the 
                preferred choice for modern law firms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={onLoginClick}
                  size="xl"
                  variant="gradient"
                  className="group"
                >
                  <span className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
