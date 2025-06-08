
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReassignClientDialogProps {
  clientId: string;
  clientName: string;
  currentAttorneyId?: string;
  onClientReassigned: () => void;
}

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function ReassignClientDialog({ clientId, clientName, currentAttorneyId, onClientReassigned }: ReassignClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedAttorney, setSelectedAttorney] = useState("");
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (open) {
      fetchAttorneys();
    }
  }, [open, profile?.firm_id]);

  const fetchAttorneys = async () => {
    if (!profile?.firm_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'attorney')
        .eq('firm_id', profile.firm_id)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error fetching attorneys:', error);
      toast.error('Failed to load attorneys');
    }
  };

  const handleReassignClient = async () => {
    if (!profile?.id || !selectedAttorney) return;

    setLoading(true);
    try {
      // Update client profile to restore and assign to new attorney
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_dropped: false,
          dropped_date: null,
          dropped_by: null,
          assigned_attorney_id: selectedAttorney
        })
        .eq('id', clientId);

      if (profileError) throw profileError;

      // Create new assignment record
      const { error: assignmentError } = await supabase
        .from('client_assignments')
        .insert({
          client_id: clientId,
          attorney_id: selectedAttorney,
          assigned_by: profile.id,
          is_active: true,
          reason: 'Reassigned by firm admin'
        });

      if (assignmentError) throw assignmentError;

      const selectedAttorneyName = attorneys.find(a => a.id === selectedAttorney);
      toast.success(`${clientName} has been reassigned to ${selectedAttorneyName?.first_name} ${selectedAttorneyName?.last_name}`);
      onClientReassigned();
      setOpen(false);
      setSelectedAttorney("");
    } catch (error: any) {
      console.error('Error reassigning client:', error);
      toast.error('Failed to reassign client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
          <UserCheck className="h-4 w-4 mr-2" />
          Reassign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Client</DialogTitle>
          <DialogDescription>
            Select an attorney to reassign {clientName} to. This will restore the client and create a new assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="attorney">Select Attorney</Label>
            <Select value={selectedAttorney} onValueChange={setSelectedAttorney}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an attorney..." />
              </SelectTrigger>
              <SelectContent>
                {attorneys.map((attorney) => (
                  <SelectItem key={attorney.id} value={attorney.id}>
                    {attorney.first_name} {attorney.last_name} ({attorney.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReassignClient} 
            disabled={loading || !selectedAttorney}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Reassigning..." : "Reassign Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
