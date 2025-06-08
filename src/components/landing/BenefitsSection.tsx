
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, TrendingUp, Users, Award, Zap } from "lucide-react";

interface BenefitsSectionProps {
  onLoginClick: () => void;
}

const BenefitsSection = ({ onLoginClick }: BenefitsSectionProps) => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase billable hour accuracy by 95%",
      description: "Automated time tracking and detailed reporting"
    },
    {
      icon: Zap,
      title: "Reduce administrative tasks by 60%",
      description: "Workflow automation and smart templates"
    },
    {
      icon: Users,
      title: "Improve client satisfaction scores",
      description: "Real-time updates and enhanced communication"
    },
    {
      icon: CheckCircle,
      title: "Ensure 100% compliance with legal ethics",
      description: "Built-in security and audit trails"
    },
    {
      icon: Award,
      title: "Scale your practice efficiently",
      description: "Unlimited users and flexible workflows"
    }
  ];

  const testimonials = [
    {
      quote: "LAWerp500 transformed our practice. We've increased our billable hours by 40% and our clients love the transparency.",
      author: "Sarah Chen, Managing Partner",
      firm: "Chen & Associates",
      case: "Personal Injury Law"
    },
    {
      quote: "The compliance features alone saved us thousands in potential violations. The security is exactly what law firms need.",
      author: "Michael Rodriguez, Senior Partner",
      firm: "Rodriguez Legal Group",
      case: "Corporate Law"
    },
    {
      quote: "Our junior attorneys are 60% more productive, and our clients feel more connected to their cases than ever before.",
      author: "Emily Watson, Founding Partner",
      firm: "Watson Family Law",
      case: "Family Law"
    }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Column - Benefits */}
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-6 text-success-600 border-success-200 bg-success-50">
                Proven Results
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                Why Top Law Firms Choose
                <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  LAWerp500
                </span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join hundreds of successful law firms that have transformed their practice 
                with our comprehensive legal management platform.
              </p>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="p-2 rounded-lg bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Industry Recognition */}
            <div className="pt-8 border-t border-border/20">
              <h4 className="text-lg font-semibold text-foreground mb-4">Industry Recognition</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-warning-500" />
                  <span>ABA TECHSHOW 2024 Winner</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-warning-500" />
                  <span>Legal Tech Innovation Award</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-warning-500" />
                  <span>G2 High Performer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-warning-500" />
                  <span>Capterra's Choice 2024</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Social Proof */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-secondary-600/10 rounded-3xl blur-3xl"></div>
            
            {/* Main CTA Card */}
            <Card className="relative bg-card/80 backdrop-blur-lg border-border/20 shadow-2xl mb-8">
              <CardHeader>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-display mb-4">
                    Ready to Transform Your Practice?
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    Join hundreds of law firms already using LAWerp500 to streamline 
                    their operations and grow their business.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    "30-day free trial with full access",
                    "White-glove onboarding included",
                    "24/7 legal-focused support",
                    "No setup fees or hidden costs"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success-500" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={onLoginClick}
                  size="xl"
                  variant="gradient"
                  className="w-full group"
                >
                  Start Your Free Trial Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  No credit card required • Setup in under 10 minutes • Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card/60 backdrop-blur-sm border-border/20 hover:bg-card/80 transition-all duration-300">
                  <CardContent className="pt-6">
                    <blockquote className="text-sm text-muted-foreground italic mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <cite className="text-sm font-semibold text-foreground not-italic">
                          {testimonial.author}
                        </cite>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.firm} • {testimonial.case}
                        </p>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 text-warning-400 fill-current">★</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
