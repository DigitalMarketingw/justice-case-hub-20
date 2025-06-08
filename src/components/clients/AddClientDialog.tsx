
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface AddClientDialogProps {
  onClientAdded?: () => void;
}

export function AddClientDialog({ onClientAdded }: AddClientDialogProps) {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    assignedAttorneyId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAttorneys();
    }
  }, [isOpen, profile?.firm_id]);

  const fetchAttorneys = async () => {
    if (!profile?.firm_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'attorney')
        .eq('firm_id', profile.firm_id)
        .order('first_name');

      if (error) {
        console.error('Error fetching attorneys:', error);
      } else {
        setAttorneys(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
    e.stopPropagation();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.firm_id) {
      toast({
        title: "Error",
        description: "No firm associated with your account",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const temporaryPassword = generateTemporaryPassword();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: temporaryPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'client',
            firm_id: profile.firm_id
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

      await supabase.rpc('log_user_activity', {
        p_user_id: authData.user.id,
        p_action: 'CLIENT_CREATED',
        p_details: {
          client_name: `${formData.firstName} ${formData.lastName}`,
          firm_id: profile.firm_id,
          assigned_attorney_id: formData.assignedAttorneyId || null,
          temporary_password: temporaryPassword
        }
      });

      toast({
        title: "Success",
        description: `Client created successfully. Temporary password: ${temporaryPassword}`,
        duration: 10000
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        assignedAttorneyId: "",
      });

      setIsOpen(false);

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

  if (!profile || !['super_admin', 'firm_admin'].includes(profile.role)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
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
            <Label htmlFor="attorney">Assigned Attorney</Label>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Client..." : "Create Client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
