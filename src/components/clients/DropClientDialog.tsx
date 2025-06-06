
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DropClientDialogProps {
  clientId: string;
  clientName: string;
  onClientDropped: () => void;
}

export function DropClientDialog({ clientId, clientName, onClientDropped }: DropClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const handleDropClient = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Update client profile to mark as dropped
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_dropped: true,
          dropped_date: new Date().toISOString(),
          dropped_by: profile.id,
          assigned_attorney_id: null
        })
        .eq('id', clientId);

      if (profileError) throw profileError;

      // Deactivate current assignment
      const { error: assignmentError } = await supabase
        .from('client_assignments')
        .update({
          is_active: false,
          unassigned_date: new Date().toISOString(),
          unassigned_by: profile.id,
          reason: reason || 'Client dropped by firm admin'
        })
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (assignmentError) throw assignmentError;

      toast.success(`${clientName} has been dropped successfully`);
      onClientDropped();
      setOpen(false);
      setReason("");
    } catch (error: any) {
      console.error('Error dropping client:', error);
      toast.error('Failed to drop client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <UserX className="h-4 w-4 mr-2" />
          Drop Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Drop Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to drop {clientName}? This will remove them from their current attorney assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for dropping this client..."
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
            onClick={handleDropClient} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Dropping..." : "Drop Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
