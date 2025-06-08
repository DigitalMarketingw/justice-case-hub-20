
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Phone } from "lucide-react";

interface LandingNavigationProps {
  onLoginClick: () => void;
  onContactClick: () => void;
}

const LandingNavigation = ({ onLoginClick, onContactClick }: LandingNavigationProps) => {
  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Resources", href: "#resources" },
    { label: "Support", href: "#support" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/bbf7762d-182e-48ac-b791-d3c06762a94c.png" 
                alt="LAWerp500 Logo" 
                className="h-12 w-auto"
              />
              {/* <div className="hidden sm:block">
                <Badge variant="outline" className="text-xs text-primary-600 border-primary-200 bg-primary-50">
                  <Shield className="w-3 h-3 mr-1" />
                  ABA Compliant
                </Badge>
              </div> */}
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Contact Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground border-r border-border/20 pr-4">
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
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
