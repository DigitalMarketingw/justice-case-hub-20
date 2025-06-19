
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreateReferralDialogEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Case {
  id: string;
  title: string;
  case_number: string;
}

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
}

interface ApprovalPreview {
  requires_case_manager: boolean;
  requires_firm_admin: boolean;
  requires_compliance: boolean;
  risk_score: number;
}

export function CreateReferralDialogEnhanced({ open, onOpenChange, onSuccess }: CreateReferralDialogEnhancedProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [approvalPreview, setApprovalPreview] = useState<ApprovalPreview | null>(null);
  const [formData, setFormData] = useState({
    case_id: "",
    referred_to_attorney_id: "",
    referral_source: "internal",
    external_source_name: "",
    referral_reason: "",
    referral_fee: "",
    priority_level: "normal",
    client_consent_obtained: false,
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [casesRes, attorneysRes] = await Promise.all([
        supabase.from('cases').select('id, title, case_number').eq('status', 'active'),
        supabase.from('profiles').select('id, first_name, last_name').eq('role', 'attorney').eq('is_active', true)
      ]);

      if (casesRes.error) throw casesRes.error;
      if (attorneysRes.error) throw attorneysRes.error;

      setCases(casesRes.data || []);
      setAttorneys(attorneysRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchApprovalPreview = async () => {
    if (!formData.referral_fee) {
      setApprovalPreview(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('determine_approval_requirements', {
        p_referral_fee: parseFloat(formData.referral_fee) || 0,
        p_case_value: 0,
        p_referral_source: formData.referral_source
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setApprovalPreview(data[0]);
      }
    } catch (error) {
      console.error('Error fetching approval preview:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    fetchApprovalPreview();
  }, [formData.referral_fee, formData.referral_source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('case_referrals')
        .insert({
          case_id: formData.case_id,
          referring_attorney_id: profile.id,
          referred_to_attorney_id: formData.referral_source === 'internal' ? formData.referred_to_attorney_id : null,
          referral_source: formData.referral_source,
          external_source_name: formData.referral_source === 'external' ? formData.external_source_name : null,
          referral_reason: formData.referral_reason,
          referral_fee: parseFloat(formData.referral_fee) || 0,
          priority_level: formData.priority_level,
          client_consent_obtained: formData.client_consent_obtained,
          notes: formData.notes,
        });

      if (error) throw error;

      toast({
        title: "Referral created successfully",
        description: "The case referral has been submitted for approval.",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        case_id: "",
        referred_to_attorney_id: "",
        referral_source: "internal",
        external_source_name: "",
        referral_reason: "",
        referral_fee: "",
        priority_level: "normal",
        client_consent_obtained: false,
        notes: "",
      });
    } catch (error) {
      console.error('Error creating referral:', error);
      toast({
        title: "Error creating referral",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'bg-green-100 text-green-800';
    if (score <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Case Referral</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="case_id">Case</Label>
              <Select
                value={formData.case_id}
                onValueChange={(value) => setFormData({ ...formData, case_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case to refer" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referral_source">Referral Type</Label>
                <Select
                  value={formData.referral_source}
                  onValueChange={(value) => setFormData({ ...formData, referral_source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal (to another attorney)</SelectItem>
                    <SelectItem value="external">External (to outside firm)</SelectItem>
                    <SelectItem value="client">Client referral</SelectItem>
                    <SelectItem value="court">Court referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority_level">Priority Level</Label>
                <Select
                  value={formData.priority_level}
                  onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.referral_source === 'internal' && (
              <div>
                <Label htmlFor="referred_to_attorney_id">Referred To Attorney</Label>
                <Select
                  value={formData.referred_to_attorney_id}
                  onValueChange={(value) => setFormData({ ...formData, referred_to_attorney_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attorney" />
                  </SelectTrigger>
                  <SelectContent>
                    {attorneys.filter(a => a.id !== profile?.id).map((attorney) => (
                      <SelectItem key={attorney.id} value={attorney.id}>
                        {attorney.first_name} {attorney.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.referral_source === 'external' && (
              <div>
                <Label htmlFor="external_source_name">External Firm/Attorney Name</Label>
                <Input
                  id="external_source_name"
                  value={formData.external_source_name}
                  onChange={(e) => setFormData({ ...formData, external_source_name: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="referral_reason">Referral Reason</Label>
              <Textarea
                id="referral_reason"
                value={formData.referral_reason}
                onChange={(e) => setFormData({ ...formData, referral_reason: e.target.value })}
                placeholder="Why is this case being referred?"
                required
              />
            </div>

            <div>
              <Label htmlFor="referral_fee" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Referral Fee ($)
              </Label>
              <Input
                id="referral_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.referral_fee}
                onChange={(e) => setFormData({ ...formData, referral_fee: e.target.value })}
                placeholder="Enter referral fee amount"
              />
            </div>

            {/* Approval Preview */}
            {approvalPreview && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Info className="w-5 h-5 mr-2" />
                    Approval Requirements Preview
                  </CardTitle>
                  <CardDescription>
                    Based on the referral details, here are the required approvals:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Assessment Score:</span>
                    <Badge className={getRiskColor(approvalPreview.risk_score)}>
                      {approvalPreview.risk_score}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Case Manager Approval:</span>
                      <Badge variant={approvalPreview.requires_case_manager ? "default" : "outline"}>
                        {approvalPreview.requires_case_manager ? "Required" : "Not Required"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Firm Admin Approval:</span>
                      <Badge variant={approvalPreview.requires_firm_admin ? "default" : "outline"}>
                        {approvalPreview.requires_firm_admin ? "Required" : "Not Required"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Review:</span>
                      <Badge variant={approvalPreview.requires_compliance ? "default" : "outline"}>
                        {approvalPreview.requires_compliance ? "Required" : "Not Required"}
                      </Badge>
                    </div>
                  </div>
                  {(approvalPreview.requires_firm_admin || approvalPreview.requires_compliance) && (
                    <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span className="text-sm text-yellow-800">
                        This referral requires additional approvals due to high value or external nature.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="client_consent"
                checked={formData.client_consent_obtained}
                onCheckedChange={(checked) => setFormData({ ...formData, client_consent_obtained: checked })}
              />
              <Label htmlFor="client_consent">Client consent obtained</Label>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
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
              {loading ? "Creating..." : "Create Referral"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
