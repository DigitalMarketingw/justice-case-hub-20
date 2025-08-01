
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingNavigationProps {
  onLoginClick: () => void;
  onContactClick: () => void;
}

const LandingNavigation = ({ onLoginClick, onContactClick }: LandingNavigationProps) => {
  const navigate = useNavigate();

  const navItems = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" }
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      // Handle anchor links (scroll to section)
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Handle route navigation
      navigate(href);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/60 backdrop-blur-lg border-b border-border/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/corbeen-logo-blue.png" 
                alt="Corbeen Logo" 
                className="h-14 w-auto cursor-pointer"
                onClick={() => navigate("/")}
              />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-primary-500 hover:text-primary-600 transition-colors font-medium relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                onClick={onContactClick}
                variant="ghost" 
                className="text-primary-500 hover:text-primary-600 hover:bg-primary-50"
              >
                Contact Us
              </Button>
              <Button 
                onClick={onLoginClick}
                variant="default"
                className="class=bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl"
              >
                Client Login 
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavigation;
