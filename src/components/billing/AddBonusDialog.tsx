
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AddBonusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
}

interface Case {
  id: string;
  title: string;
  case_number: string;
}

export function AddBonusDialog({ open, onOpenChange, onSuccess }: AddBonusDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [formData, setFormData] = useState({
    attorney_id: "",
    case_id: "",
    bonus_amount: "",
    bonus_type: "performance",
    description: "",
  });

  const fetchAttorneys = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'attorney')
        .eq('is_active', true);

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error fetching attorneys:', error);
    }
  };

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, case_number')
        .eq('status', 'active');

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAttorneys();
      fetchCases();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('attorney_bonuses')
        .insert({
          attorney_id: formData.attorney_id,
          case_id: formData.case_id || null,
          bonus_amount: parseFloat(formData.bonus_amount),
          bonus_type: formData.bonus_type,
          description: formData.description,
          awarded_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Bonus awarded successfully",
        description: "The attorney bonus has been recorded.",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        attorney_id: "",
        case_id: "",
        bonus_amount: "",
        bonus_type: "performance",
        description: "",
      });
    } catch (error) {
      console.error('Error adding bonus:', error);
      toast({
        title: "Error awarding bonus",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Award Attorney Bonus</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="attorney_id">Attorney</Label>
              <Select
                value={formData.attorney_id}
                onValueChange={(value) => setFormData({ ...formData, attorney_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attorney" />
                </SelectTrigger>
                <SelectContent>
                  {attorneys.map((attorney) => (
                    <SelectItem key={attorney.id} value={attorney.id}>
                      {attorney.first_name} {attorney.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bonus_amount">Bonus Amount ($)</Label>
              <Input
                id="bonus_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.bonus_amount}
                onChange={(e) => setFormData({ ...formData, bonus_amount: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="bonus_type">Bonus Type</Label>
              <Select
                value={formData.bonus_type}
                onValueChange={(value) => setFormData({ ...formData, bonus_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="case_completion">Case Completion</SelectItem>
                  <SelectItem value="client_satisfaction">Client Satisfaction</SelectItem>
                  <SelectItem value="billing_target">Billing Target</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="case_id">Related Case (Optional)</Label>
              <Select
                value={formData.case_id}
                onValueChange={(value) => setFormData({ ...formData, case_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((case_item) => (
                    <SelectItem key={case_item.id} value={case_item.id}>
                      {case_item.case_number} - {case_item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Reason for bonus..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Awarding..." : "Award Bonus"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
