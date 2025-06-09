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

interface Firm {
  id: string;
  name: string;
}

interface AddAttorneyDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAttorneyAdded?: () => void;
}

export function AddAttorneyDialog({ open, onOpenChange, onAttorneyAdded }: AddAttorneyDialogProps) {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    barNumber: "",
    specialization: "",
    yearsExperience: "",
    hourlyRate: "",
    firmId: profile?.firm_id || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  useEffect(() => {
    const fetchFirms = async () => {
      if (!dialogOpen) return;

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

    fetchFirms();
  }, [dialogOpen, profile]);

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      barNumber: "",
      specialization: "",
      yearsExperience: "",
      hourlyRate: "",
      firmId: profile?.firm_id || "",
    });
    setDialogOpen(false);
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

    const targetFirmId = formData.firmId || profile?.firm_id;
    if (!targetFirmId) {
      toast({
        title: "Error",
        description: "No firm selected or available",
        variant: "destructive"
      });
      return;
    }

    if (profile?.role === 'firm_admin' && profile?.firm_id !== targetFirmId) {
      toast({
        title: "Error",
        description: "You can only create attorneys for your firm",
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
            role: 'attorney',
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

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone || null,
          created_by: user?.id,
          invited_at: new Date().toISOString(),
          password_reset_required: true
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      const { error: attorneyError } = await supabase
        .from('attorneys')
        .update({
          bar_number: formData.barNumber || null,
          specialization: formData.specialization ? [formData.specialization] : null,
          years_of_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        })
        .eq('id', authData.user.id);

      if (attorneyError) {
        console.error('Error updating attorney info:', attorneyError);
      }

      await supabase.rpc('log_user_activity', {
        p_user_id: authData.user.id,
        p_action: 'ATTORNEY_CREATED',
        p_details: {
          attorney_name: `${formData.firstName} ${formData.lastName}`,
          firm_id: targetFirmId,
          bar_number: formData.barNumber || null,
          temporary_password: temporaryPassword
        }
      });

      toast({
        title: "Success",
        description: `Attorney created successfully. Temporary password: ${temporaryPassword}`,
        duration: 10000
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        barNumber: "",
        specialization: "",
        yearsExperience: "",
        hourlyRate: "",
        firmId: profile?.firm_id || "",
      });

      setDialogOpen(false);

      if (onAttorneyAdded) {
        onAttorneyAdded();
      }

    } catch (error) {
      console.error('Error adding attorney:', error);
      toast({
        title: "Error",
        description: "Failed to create attorney",
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Attorney
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add New Attorney</DialogTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barNumber">Bar Number</Label>
              <Input
                id="barNumber"
                value={formData.barNumber}
                onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={formData.yearsExperience}
                onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Corporate Law"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Attorney..." : "Create Attorney"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
