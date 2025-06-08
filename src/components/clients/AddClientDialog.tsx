
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
import { useAuth } from "@/contexts/AuthContext";

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
}

interface Firm {
  id: string;
  name: string;
}

interface AddClientDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClientAdded?: () => void;
}

export function AddClientDialog({ open, onOpenChange, onClientAdded }: AddClientDialogProps) {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    assignedAttorneyId: "",
    firmId: profile?.firm_id || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  useEffect(() => {
    const fetchData = async () => {
      if (!dialogOpen) return;

      // Fetch attorneys based on user role
      let attorneyQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, firm_id')
        .eq('role', 'attorney')
        .eq('is_active', true)
        .order('first_name');

      // If firm admin, only show attorneys from their firm
      if (profile?.role === 'firm_admin' && profile?.firm_id) {
        attorneyQuery = attorneyQuery.eq('firm_id', profile.firm_id);
      }

      const { data: attorneyData, error: attorneyError } = await attorneyQuery;

      if (attorneyError) {
        console.error('Error fetching attorneys:', attorneyError);
        toast({
          title: "Error",
          description: "Failed to load attorneys",
          variant: "destructive"
        });
        return;
      }

      setAttorneys(attorneyData || []);

      // Only super admins can select firms, firm admins are limited to their firm
      if (profile?.role === 'super_admin') {
        const { data: firmData, error: firmError } = await supabase
          .from('firms')
          .select('id, name')
          .order('name');

        if (firmError) {
          console.error('Error fetching firms:', firmError);
        } else {
          setFirms(firmData || []);
        }
      }
    };

    fetchData();
  }, [dialogOpen, profile]);

  // Generate a secure temporary password
  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

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

    // Validate firm assignment
    const targetFirmId = formData.firmId || profile?.firm_id;
    if (!targetFirmId) {
      toast({
        title: "Error",
        description: "No firm selected or available",
        variant: "destructive"
      });
      return;
    }

    // Ensure firm admin can only create clients in their firm
    if (profile?.role === 'firm_admin' && profile?.firm_id !== targetFirmId) {
      toast({
        title: "Error",
        description: "You can only create clients for your firm",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const temporaryPassword = generateTemporaryPassword();

      // Create the user in auth with proper metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: temporaryPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'client',
            firm_id: targetFirmId
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
          description: "Failed to create user account",
          variant: "destructive"
        });
        return;
      }

      // Update the profile with additional client info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone || null,
          assigned_attorney_id: formData.assignedAttorneyId || null,
          created_by: user?.id,
          invited_at: new Date().toISOString(),
          password_reset_required: true
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
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

      // Log the activity
      await supabase.rpc('log_user_activity', {
        p_user_id: authData.user.id,
        p_action: 'CLIENT_CREATED',
        p_details: {
          client_name: `${formData.firstName} ${formData.lastName}`,
          firm_id: targetFirmId,
          assigned_attorney_id: formData.assignedAttorneyId || null,
          temporary_password: temporaryPassword // Include for admin reference
        }
      });

      toast({
        title: "Success",
        description: `Client created successfully. Temporary password: ${temporaryPassword}`,
        duration: 10000 // Show longer so admin can copy password
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
        firmId: profile?.firm_id || "",
      });

      setDialogOpen(false);

      if (onClientAdded) {
        onClientAdded();
      }

    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show to admins
  if (!profile || !['super_admin', 'firm_admin'].includes(profile.role)) {
    return null;
  }

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

          {/* Firm selection - only for super admin */}
          {profile?.role === 'super_admin' && (
            <div className="space-y-2">
              <Label htmlFor="firm">Firm *</Label>
              <Select
                value={formData.firmId}
                onValueChange={(value) => setFormData({ ...formData, firmId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a firm" />
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
          )}

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
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
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
            {isSubmitting ? "Creating Client..." : "Create Client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
