import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DropCaseDialogProps {
  caseId: string;
  caseTitle: string;
  onCaseDropped: () => void;
}

export function DropCaseDialog({ caseId, caseTitle, onCaseDropped }: DropCaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const handleDropCase = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Update case to mark as dropped
      const { error } = await supabase
        .from('cases')
        .update({
          is_dropped: true,
          dropped_date: new Date().toISOString(),
          dropped_by: profile.id,
          drop_reason: reason || `Case dropped by ${profile.role === 'case_manager' ? 'case manager' : 'firm admin'}`
        })
        .eq('id', caseId);

      if (error) throw error;

      toast.success(`${caseTitle} has been dropped successfully`);
      onCaseDropped();
      setOpen(false);
      setReason("");
    } catch (error: any) {
      console.error('Error dropping case:', error);
      toast.error('Failed to drop case');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <FileX className="h-4 w-4 mr-2" />
          Drop Case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Drop Case</DialogTitle>
          <DialogDescription>
            Are you sure you want to drop "{caseTitle}"? This will mark the case as dropped and remove it from active cases.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for dropping this case..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleDropCase} 
            disabled={loading}
            variant="destructive"
          >
            {loading ? "Dropping..." : "Drop Case"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}