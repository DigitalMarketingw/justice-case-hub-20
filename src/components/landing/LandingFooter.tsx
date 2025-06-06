
import { Scale } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Scale className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold text-white">LAWerp500</span>
        </div>
        <p className="text-gray-400">
          © 2024 LAWerp500. All rights reserved. Empowering law firms worldwide.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
