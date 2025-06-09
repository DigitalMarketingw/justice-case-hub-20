
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingNavigationProps {
  onLoginClick: () => void;
  onContactClick: () => void;
}

const LandingNavigation = ({ onLoginClick, onContactClick }: LandingNavigationProps) => {
  const navigate = useNavigate();

  const navItems = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "#resources" },
    { label: "Support", href: "#support" }
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
                src="/lovable-uploads/bbf7762d-182e-48ac-b791-d3c06762a94c.png" 
                alt="LAWerp500 Logo" 
                className="h-12 w-auto cursor-pointer"
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
            {/* Contact Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-foreground border-r border-border/20 pr-4">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>(555) 123-LEGAL</span>
              </div>
            </div>

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
                className="bg-primary-600 hover:bg-primary-700 text-primary-foreground"
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
