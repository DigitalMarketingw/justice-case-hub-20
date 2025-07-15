
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingNavigation from "@/components/landing/LandingNavigation";
import LandingFooter from "@/components/landing/LandingFooter";

const Pricing = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const handleContactClick = () => {
    navigate("/contact");
  };

  const pricingTiers = [
    {
      name: "Starter",
      price: "$49",
      period: "per attorney/month",
      description: "Perfect for solo practitioners and small firms",
      features: [
        "Up to 3 attorneys",
        "Unlimited clients",
        "Basic case management",
        "Time tracking",
        "Document storage (10GB)",
        "Email support",
        "Basic reporting"
      ],
      limitations: [
        "Advanced analytics",
        "Court integrations",
        "Custom workflows",
        "API access"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "$99",
      period: "per attorney/month",
      description: "Ideal for growing firms with advanced needs",
      features: [
        "Up to 25 attorneys",
        "Unlimited clients",
        "Advanced case management",
        "Time & expense tracking",
        "Document storage (100GB)",
        "Client portal",
        "Court calendar integration",
        "Advanced reporting",
        "Phone support",
        "Custom workflows"
      ],
      limitations: [
        "Multi-location support",
        "Advanced integrations",
        "Dedicated support"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "per attorney/month",
      description: "For large firms requiring enterprise features",
      features: [
        "Unlimited attorneys",
        "Unlimited clients",
        "Complete case management suite",
        "Advanced time & billing",
        "Unlimited document storage",
        "White-label client portal",
        "Full court integrations",
        "Advanced analytics & BI",
        "Multi-location support",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "Priority support"
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales"
    },
    {
      name: "Custom",
      price: "Contact us",
      period: "for pricing",
      description: "Tailored solutions for unique requirements",
      features: [
        "Custom feature development",
        "Dedicated infrastructure",
        "Advanced security options",
        "Custom integrations",
        "White-label solutions",
        "Professional services",
        "Training & onboarding",
        "24/7 premium support"
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const faqs = [
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial for all paid plans. No credit card required."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "What's included in support?",
      answer: "All plans include comprehensive support. Higher tiers include phone support and dedicated account management."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade security with ABA compliance, encryption, and regular security audits."
    },
    {
      question: "Do you offer volume discounts?",
      answer: "Yes, we offer discounts for firms with 50+ attorneys. Contact our sales team for custom pricing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <LandingNavigation onLoginClick={handleLoginClick} onContactClick={handleContactClick} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 text-primary-200 border-primary-200/30">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Choose the Right Plan
              <span className="block text-primary-300">For Your Firm</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Flexible pricing designed to grow with your practice. All plans include core features 
              with no hidden fees or long-term contracts.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {pricingTiers.map((tier, index) => (
                <Card 
                  key={index}
                  className={`relative bg-card/10 backdrop-blur-sm border-border/20 hover:bg-card/20 transition-all duration-500 hover:scale-105 ${
                    tier.popular ? 'border-primary-400/50 bg-card/20' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center space-y-4 pb-8">
                    <CardTitle className="text-2xl font-display text-white">
                      {tier.name}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary-300">
                        {tier.price}
                      </div>
                      <div className="text-sm text-slate-400">
                        {tier.period}
                      </div>
                    </div>
                    <CardDescription className="text-slate-300">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <Check className="h-4 w-4 text-primary-400 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </div>
                      ))}
                      {tier.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-center space-x-3 opacity-50">
                          <X className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <span className="text-sm text-slate-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={tier.cta === "Contact Sales" ? handleContactClick : handleLoginClick}
                      className={`w-full ${
                        tier.popular 
                          ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                          : 'bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 border border-primary-400/30'
                      }`}
                      variant={tier.popular ? "default" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-300">
                Everything you need to know about our pricing and plans.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-card/10 backdrop-blur-sm border-border/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-display text-white">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of legal professionals who trust LAWerp500 to manage their practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLoginClick}
                size="lg" 
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Start Free Trial
              </Button>
              <Button 
                onClick={handleContactClick}
                variant="outline" 
                size="lg"
                className="border-primary-400/30 text-primary-300 hover:bg-primary-500/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Pricing;
