
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BonusCriteriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BonusCriteria {
  id: string;
  name: string;
  description: string;
  criteria_type: string;
  target_value: number;
  bonus_amount: number;
  is_active: boolean;
}

export function BonusCriteriaDialog({ open, onOpenChange }: BonusCriteriaDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState<BonusCriteria[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    criteria_type: "case_completion",
    target_value: "",
    bonus_amount: "",
  });

  const fetchCriteria = async () => {
    try {
      const { data, error } = await supabase
        .from('bonus_criteria')
        .select('*')
        .eq('firm_id', profile?.firm_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCriteria(data || []);
    } catch (error) {
      console.error('Error fetching criteria:', error);
    }
  };

  useEffect(() => {
    if (open && profile?.firm_id) {
      fetchCriteria();
    }
  }, [open, profile?.firm_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bonus_criteria')
        .insert({
          name: formData.name,
          description: formData.description,
          criteria_type: formData.criteria_type,
          target_value: parseFloat(formData.target_value),
          bonus_amount: parseFloat(formData.bonus_amount),
          firm_id: profile.firm_id,
          created_by: profile.id,
        });

      if (error) throw error;

      toast({
        title: "Bonus criteria created",
        description: "New bonus criteria has been added.",
      });

      fetchCriteria();
      setShowAddForm(false);
      setFormData({
        name: "",
        description: "",
        criteria_type: "case_completion",
        target_value: "",
        bonus_amount: "",
      });
    } catch (error) {
      console.error('Error adding criteria:', error);
      toast({
        title: "Error creating criteria",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCriteria = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('bonus_criteria')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      fetchCriteria();
    } catch (error) {
      console.error('Error updating criteria:', error);
    }
  };

  const deleteCriteria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bonus_criteria')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCriteria();
      toast({
        title: "Criteria deleted",
        description: "Bonus criteria has been removed.",
      });
    } catch (error) {
      console.error('Error deleting criteria:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Bonus Criteria Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New Criteria */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bonus Criteria</h3>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Criteria
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Criteria Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="criteria_type">Type</Label>
                  <Select
                    value={formData.criteria_type}
                    onValueChange={(value) => setFormData({ ...formData, criteria_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="case_completion">Case Completion</SelectItem>
                      <SelectItem value="billing_target">Billing Target</SelectItem>
                      <SelectItem value="client_satisfaction">Client Satisfaction</SelectItem>
                      <SelectItem value="referral_count">Referral Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_value">Target Value</Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    required
                  />
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
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the bonus criteria..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Criteria"}
                </Button>
              </div>
            </form>
          )}

          {/* Criteria Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteria.map((criterion) => (
                <TableRow key={criterion.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{criterion.name}</div>
                      <div className="text-sm text-muted-foreground">{criterion.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{criterion.criteria_type.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>{criterion.target_value}</TableCell>
                  <TableCell>${criterion.bonus_amount}</TableCell>
                  <TableCell>
                    <Switch
                      checked={criterion.is_active}
                      onCheckedChange={(checked) => toggleCriteria(criterion.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCriteria(criterion.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
