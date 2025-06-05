
import { Button } from "@/components/ui/button";
import { Scale, ArrowRight } from "lucide-react";

interface LandingNavigationProps {
  onLoginClick: () => void;
}

const LandingNavigation = ({ onLoginClick }: LandingNavigationProps) => {
  return (
    <nav className="relative z-10 p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Scale className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold text-white">JusticeHub</span>
        </div>
        <Button 
          onClick={onLoginClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Login / Register
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};

export default LandingNavigation;
