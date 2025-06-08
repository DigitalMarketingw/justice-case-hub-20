
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Star,
  Target,
  Zap
} from "lucide-react";
import { UserRole } from "@/types/auth";

interface OnboardingFlowProps {
  userRole: UserRole;
  onComplete: () => void;
}

const OnboardingFlow = ({ userRole, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const getStepsForRole = (role: UserRole) => {
    const baseSteps = [
      {
        title: "Welcome to LAWerp500",
        description: "Let's get you set up for success",
        icon: Star,
        content: "Welcome! We're excited to help you streamline your legal practice."
      }
    ];

    const roleSpecificSteps = {
      attorney: [
        {
          title: "Set Up Your Profile",
          description: "Complete your attorney profile",
          icon: Users,
          content: "Add your bar admission details, practice areas, and professional information."
        },
        {
          title: "Import Your Cases",
          description: "Bring your existing cases into the system",
          icon: FileText,
          content: "Upload case files or manually add your current active cases."
        },
        {
          title: "Configure Calendar",
          description: "Sync your calendar and set availability",
          icon: Calendar,
          content: "Connect your calendar and set your working hours and preferences."
        },
        {
          title: "Set Up Billing",
          description: "Configure your billing rates and methods",
          icon: DollarSign,
          content: "Set your hourly rates, retainer preferences, and payment methods."
        }
      ],
      firm_admin: [
        {
          title: "Firm Setup",
          description: "Configure your firm's basic information",
          icon: Users,
          content: "Add firm details, locations, and organizational structure."
        },
        {
          title: "Add Attorneys",
          description: "Invite your team members",
          icon: Users,
          content: "Send invitations to attorneys and staff to join your firm."
        },
        {
          title: "Configure Billing",
          description: "Set up firm-wide billing policies",
          icon: DollarSign,
          content: "Configure billing rates, payment terms, and client invoicing preferences."
        }
      ],
      client: [
        {
          title: "Complete Your Profile",
          description: "Provide your contact information",
          icon: Users,
          content: "Add your contact details and communication preferences."
        },
        {
          title: "Review Your Cases",
          description: "See your active legal matters",
          icon: FileText,
          content: "Review the cases your attorney has shared with you."
        }
      ],
      super_admin: [
        {
          title: "System Overview",
          description: "Learn about system administration",
          icon: Target,
          content: "Get familiar with system-wide controls and monitoring tools."
        }
      ]
    };

    return [...baseSteps, ...roleSpecificSteps[role]];
  };

  const steps = getStepsForRole(userRole);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-xs bg-primary-50 text-primary-700 border-primary-200 px-3 py-1">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
              
              <Progress value={progress} className="w-full h-2" />
              
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-primary-50 rounded-full">
                    <StepIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-2xl font-display text-gray-900">
                      {currentStepData.title}
                    </CardTitle>
                    <p className="text-gray-600">{currentStepData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                {currentStepData.content}
              </p>
              
              {currentStep === 0 && (
                <div className="bg-primary-50 rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold text-primary-900">
                    What makes LAWerp500 special?
                  </h4>
                  <div className="grid gap-3">
                    {[
                      "ABA-compliant practice management",
                      "Advanced case and client management",
                      "Integrated billing and time tracking",
                      "Secure document management",
                      "Real-time collaboration tools"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm text-primary-800">
                        <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentStep > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-warning-500" />
                    <span>You can complete this step later in your settings</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-800"
              >
                Skip Setup
              </Button>
              
              <Button 
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>
                  {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center space-x-2 pt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-primary-600"
                      : completedSteps.has(index)
                      ? "bg-success-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
