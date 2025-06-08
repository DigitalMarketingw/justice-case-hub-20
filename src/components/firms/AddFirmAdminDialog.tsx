
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface AddFirmAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminAdded?: () => void;
}

export function AddFirmAdminDialog({ open, onOpenChange, onAdminAdded }: AddFirmAdminDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    firmId: "",
  });

  // Fetch firms for selection
  const { data: firms } = useQuery({
    queryKey: ['firms-for-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firms')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.firmId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      console.log('Creating firm admin with data:', formData);

      // Create the user account and profile in one step using the auth.users trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: 'TempPassword123!', // Temporary password that admin will reset
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            role: 'firm_admin',
            firm_id: formData.firmId,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('Auth user created:', authData.user?.id);

      // If the trigger didn't create the profile, create it manually
      if (authData.user) {
        // Wait a moment for the trigger to potentially run
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!existingProfile) {
          console.log('Creating profile manually as trigger may not have run');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: formData.email.trim(),
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
              phone: formData.phone.trim() || null,
              role: 'firm_admin',
              firm_id: formData.firmId,
              password_reset_required: true,
              is_active: true,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }
        } else {
          console.log('Profile already exists from trigger');
        }
      }

      toast({
        title: "Success",
        description: "Firm administrator created successfully. They will receive an email to set up their account.",
      });

      // Reset form
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        firmId: "",
      });
      
      onOpenChange(false);
      onAdminAdded?.();

    } catch (error: any) {
      console.error('Error creating firm admin:', error);
      toast({
        title: "Error creating firm administrator",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        firmId: "",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Firm Administrator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firmId">Firm *</Label>
            <Select value={formData.firmId} onValueChange={(value) => handleInputChange('firmId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a firm" />
              </SelectTrigger>
              <SelectContent>
                {firms?.map((firm) => (
                  <SelectItem key={firm.id} value={firm.id}>
                    {firm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="First name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Administrator...' : 'Create Administrator'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
