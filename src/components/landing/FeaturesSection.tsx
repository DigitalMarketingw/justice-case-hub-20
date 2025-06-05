
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Shield,
  FileText,
  Briefcase
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Briefcase,
      title: "Case Management",
      description: "Organize cases, track deadlines, and manage documents in one centralized platform",
      color: "text-blue-400"
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Give clients secure access to their case information and important documents",
      color: "text-purple-400"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent calendar management with conflict detection and automated reminders",
      color: "text-green-400"
    },
    {
      icon: DollarSign,
      title: "Billing & Invoicing",
      description: "Track billable hours, generate invoices, and manage payments seamlessly",
      color: "text-yellow-400"
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Secure document storage with version control and collaboration features",
      color: "text-red-400"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Bank-level security with role-based access and audit trails",
      color: "text-indigo-400"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-r from-slate-800/50 to-blue-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything Your Law Firm Needs
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From case management to billing, we've got you covered with professional-grade tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
