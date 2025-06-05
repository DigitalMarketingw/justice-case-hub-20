
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

interface BenefitsSectionProps {
  onLoginClick: () => void;
}

const BenefitsSection = ({ onLoginClick }: BenefitsSectionProps) => {
  const benefits = [
    "Increase billable hour tracking accuracy by 95%",
    "Reduce administrative tasks by 40%",
    "Improve client satisfaction with real-time updates",
    "Ensure compliance with built-in security features",
    "Scale your practice with unlimited user support"
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-8">
              Why Law Firms Choose JusticeHub
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
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
                  onClick={onLoginClick}
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
  );
};

export default BenefitsSection;
