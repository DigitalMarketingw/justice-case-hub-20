
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Firm {
  id: string;
  name: string;
}

interface TransferClientDialogProps {
  clientId: string;
  clientName: string;
  currentFirmId: string;
  onClientTransferred: () => void;
}

export function TransferClientDialog({ 
  clientId, 
  clientName, 
  currentFirmId,
  onClientTransferred 
}: TransferClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFirmId, setSelectedFirmId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [firms, setFirms] = useState<Firm[]>([]);
  const { profile } = useAuth();

  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    if (open && isSuperAdmin) {
      fetchFirms();
    }
  }, [open, isSuperAdmin]);

  const fetchFirms = async () => {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('id, name')
        .neq('id', currentFirmId) // Exclude current firm
        .order('name');

      if (error) throw error;
      setFirms(data || []);
    } catch (error) {
      console.error('Error fetching firms:', error);
      toast.error('Failed to load firms');
    }
  };

  const handleTransferClient = async () => {
    if (!profile?.id || !selectedFirmId) return;

    setLoading(true);
    try {
      // Update client profile to transfer to new firm and mark as dropped
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          firm_id: selectedFirmId,
          is_dropped: true,
          dropped_date: new Date().toISOString(),
          dropped_by: profile.id,
          assigned_attorney_id: null,
          transferred_from_firm_id: currentFirmId,
          transferred_date: new Date().toISOString(),
          transferred_by: profile.id
        })
        .eq('id', clientId);

      if (profileError) throw profileError;

      // Deactivate current assignment if any
      const { error: assignmentError } = await supabase
        .from('client_assignments')
        .update({
          is_active: false,
          unassigned_date: new Date().toISOString(),
          unassigned_by: profile.id,
          reason: `Client transferred to another firm: ${reason || 'No reason provided'}`
        })
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (assignmentError) throw assignmentError;

      // Create transfer history record
      const { error: transferError } = await supabase
        .from('client_transfers')
        .insert({
          client_id: clientId,
          from_firm_id: currentFirmId,
          to_firm_id: selectedFirmId,
          transferred_by: profile.id,
          reason: reason || null
        });

      if (transferError) throw transferError;

      toast.success(`${clientName} has been transferred successfully`);
      onClientTransferred();
      setOpen(false);
      setSelectedFirmId("");
      setReason("");
    } catch (error: any) {
      console.error('Error transferring client:', error);
      toast.error('Failed to transfer client');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Transfer Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Client to Another Firm</DialogTitle>
          <DialogDescription>
            Transfer {clientName} to a different law firm. The client will appear in the new firm's dropped clients list and can be reassigned by their firm admin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="firm">Select Target Firm</Label>
            <Select value={selectedFirmId} onValueChange={setSelectedFirmId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a firm to transfer to..." />
              </SelectTrigger>
              <SelectContent>
                {firms.map((firm) => (
                  <SelectItem key={firm.id} value={firm.id}>
                    {firm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="reason">Transfer Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for transferring this client..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransferClient} 
            disabled={loading || !selectedFirmId}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "Transferring..." : "Transfer Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
