
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
}

interface AddClientDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClientAdded?: () => void;
}

export function AddClientDialog({ open, onOpenChange, onClientAdded }: AddClientDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    assignedAttorneyId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  useEffect(() => {
    const fetchAttorneys = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'attorney')
        .order('first_name');

      if (error) {
        console.error('Error fetching attorneys:', error);
        return;
      }

      setAttorneys(data || []);
    };

    if (dialogOpen) {
      fetchAttorneys();
    }
  }, [dialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the user in auth first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temporary123', // You should generate a secure temporary password
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'client'
          }
        }
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Error",
          description: "Failed to create user",
          variant: "destructive"
        });
        return;
      }

      // Update the client record with additional info
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          address: formData.address || null,
          notes: formData.notes || null,
        })
        .eq('id', authData.user.id);

      if (clientError) {
        console.error('Error updating client info:', clientError);
      }

      toast({
        title: "Success",
        description: "Client added successfully"
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        assignedAttorneyId: "",
      });

      setDialogOpen(false);

      if (onClientAdded) {
        onClientAdded();
      }

    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedAttorney">Assigned Attorney</Label>
            <Select
              value={formData.assignedAttorneyId}
              onValueChange={(value) => setFormData({ ...formData, assignedAttorneyId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an attorney" />
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding Client..." : "Add Client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
