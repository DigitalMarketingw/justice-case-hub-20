
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ArrowRight,
  Briefcase,
  Clock,
  DollarSign
} from "lucide-react";

interface HeroSectionProps {
  onLoginClick: () => void;
}

const HeroSection = ({ onLoginClick }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-400/30">
              Complete Law Firm Management
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Streamline Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Legal Practice</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Comprehensive case management, client relations, and billing solutions 
              designed specifically for modern law firms. Increase efficiency and grow your practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onLoginClick}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-400 text-gray-300 hover:bg-white/10 px-8 py-4 rounded-lg transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader className="pb-3">
                    <Users className="h-8 w-8 text-blue-400 mb-2" />
                    <CardTitle className="text-lg">1,200+</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">Active Clients</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader className="pb-3">
                    <Briefcase className="h-8 w-8 text-purple-400 mb-2" />
                    <CardTitle className="text-lg">850+</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">Cases Managed</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader className="pb-3">
                    <Clock className="h-8 w-8 text-green-400 mb-2" />
                    <CardTitle className="text-lg">40%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">Time Saved</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader className="pb-3">
                    <DollarSign className="h-8 w-8 text-yellow-400 mb-2" />
                    <CardTitle className="text-lg">$2M+</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">Revenue Tracked</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
