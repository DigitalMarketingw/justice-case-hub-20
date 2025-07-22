
import { Scale, Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LandingFooter = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Security", href: "#security" },
        { label: "Integrations", href: "#integrations" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#privacy" },
        { label: "Terms of Service", href: "#terms" },
        { label: "Ethics Compliance", href: "#ethics" },
        { label: "Data Processing", href: "#data" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#help" },
        { label: "Documentation", href: "#docs" },
        { label: "Training", href: "#training" },
        { label: "Status", href: "#status" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Careers", href: "#careers" },
        { label: "Press Kit", href: "#press" },
        { label: "Partners", href: "#partners" }
      ]
    }
  ];

  const certifications = [
    "SOC 2 Type II",
    "ISO 27001",
    "GDPR Compliant",
    "HIPAA Ready"
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center space-x-3">
                <Scale className="h-8 w-8 text-primary-400" />
                <span className="text-2xl font-display font-bold text-white">Corbeen</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Empowering law firms worldwide with comprehensive practice management solutions 
                that increase efficiency and ensure compliance.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span>+1(972) 499-6969</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span>support@Corbeen.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>Suite 2450, 2711 N Haskell Ave., Dallas, TX 75204</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="text-slate-300 hover:text-primary-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-300 hover:text-primary-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Navigation Columns */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a 
                        href={link.href} 
                        className="text-slate-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Compliance Section */}
        <div className="py-8 border-t border-slate-700">
          <div className="text-center space-y-4">
            <h5 className="text-sm font-semibold text-white">Security & Compliance Certifications</h5>
            <div className="flex flex-wrap justify-center gap-3">
              {certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="bg-slate-800 border-slate-600 text-slate-300">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-slate-300 text-sm">
                © 2024 Corbeen. All rights reserved. Professional legal practice management software.
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Built by legal professionals, for legal professionals.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-xs text-slate-400">
              <span>Attorney Advertising</span>
              <span>•</span>
              <span>Prior Results Do Not Guarantee Similar Outcomes</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
