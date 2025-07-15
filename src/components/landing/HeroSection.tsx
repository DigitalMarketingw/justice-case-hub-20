
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ArrowRight,
  Briefcase,
  Clock,
  DollarSign,
  Shield,
  Award,
  CheckCircle,
  Mail
} from "lucide-react";

interface HeroSectionProps {
  onContactClick: () => void;
}

const HeroSection = ({ onContactClick }: HeroSectionProps) => {
  const trustIndicators = [
    // "SOC 2 Type II Compliant",
    // "ABA Technology Partner",
    // "99.9% Uptime SLA",
    // "Bank-Level Security"
  ];

  const achievements = [
    { icon: Users, value: "2,500+", label: "Law Firms Trust Us", color: "text-primary-400" },
    { icon: Briefcase, value: "50K+", label: "Cases Managed", color: "text-secondary-400" },
    { icon: Clock, value: "60%", label: "Time Saved Daily", color: "text-secondary-400" },
    { icon: DollarSign, value: "$10M+", label: "Revenue Tracked", color: "text-secondary-400" }
  ];

  return (
    <section className="relative overflow-hidden px-6 py-20 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-surface"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-8">
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
              {trustIndicators.map((indicator, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                  <Shield className="w-3 h-3 mr-1" />
                  {indicator}
                </Badge>
              ))}
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-foreground leading-tight">
                The Complete
                <span className="block bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Legal Practice
                </span>
                Management Suite
              </h1>
              <p className="text-xl lg:text-2xl text-foreground/80 leading-relaxed font-medium">
                Trusted by top law firms to streamline operations, increase billable hours, 
                and deliver exceptional client experiences. Join the legal technology revolution.
              </p>
            </div>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
              {[
                "Increase billable hours by 35%",
                "Reduce admin time by 60%",
                "Improve client satisfaction",
                "Ensure ABA compliance"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start pt-4">
              <Button 
                onClick={onContactClick}
                size="xl"
                variant="gradient"
                className="group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-border/20">
              <p className="text-sm text-foreground/70 mb-4">Trusted by leading law firms including:</p>
              <div className="flex items-center space-x-6 text-primary-500">
                <span className="font-semibold text-lg">BigLaw Partners</span>
                <span className="font-semibold text-lg">Legal Associates</span>
                <span className="font-semibold text-lg">Family Law Group</span>
              </div>
            </div>
          </div>
          
          {/* Right Side - Stats Dashboard */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-card/80 backdrop-blur-lg rounded-3xl p-8 border border-border/20 shadow-2xl">
              <div className="text-center mb-8">
                <Award className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Industry Leading Results
                </h3>
                <p className="text-foreground/70">
                  Real metrics from our law firm partners
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="bg-background/50 border-border/20 hover:bg-background/70 transition-all duration-300 hover:scale-105">
                    <CardHeader className="pb-3">
                      <achievement.icon className={`h-8 w-8 ${achievement.color} mb-2`} />
                      <CardTitle className="text-2xl font-display">{achievement.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70 font-medium">{achievement.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Trust Element */}
              <div className="mt-8 pt-6 border-t border-border/20 text-center">
                <div className="flex items-center justify-center space-x-2 text-success-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-semibold">100% Compliant with Legal Ethics Rules</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
