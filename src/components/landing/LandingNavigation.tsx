
import { Button } from "@/components/ui/button";

interface LandingNavigationProps {
  onLoginClick: () => void;
}

const LandingNavigation = ({ onLoginClick }: LandingNavigationProps) => {
  return (
    <nav className="flex items-center justify-between p-6">
      <div className="flex items-center space-x-3">
        <img 
          src="/lovable-uploads/bbf7762d-182e-48ac-b791-d3c06762a94c.png" 
          alt="LAWerp500 Logo" 
          className="h-10 w-auto"
        />
        
      </div>
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10"
        >
          Features
        </Button>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10"
        >
          Pricing
        </Button>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10"
        >
          About
        </Button>
        <Button 
          onClick={onLoginClick}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Login
        </Button>
      </div>
    </nav>
  );
};

export default LandingNavigation;
