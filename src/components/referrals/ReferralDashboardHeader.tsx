
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ReferralDashboardHeaderProps {
  onCreateReferral: () => void;
}

export function ReferralDashboardHeader({ onCreateReferral }: ReferralDashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Case Referral Dashboard</h1>
        <p className="text-gray-600">Manage case referrals and monitor concentration risks</p>
      </div>
      <Button onClick={onCreateReferral}>
        <Plus className="w-4 h-4 mr-2" />
        New Referral
      </Button>
    </div>
  );
}
