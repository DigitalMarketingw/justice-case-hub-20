
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAttorneyForm } from "./hooks/useAttorneyForm";
import { AttorneyFormFields } from "./components/AttorneyFormFields";
import { createAttorney } from "./utils/attorneyApi";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { formData, resetForm, updateField } = useAttorneyForm();

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

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    resetForm();
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
      await createAttorney(formData, targetFirmId, user?.id || '', toast);
      
      resetForm();
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Attorney</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AttorneyFormFields
            formData={formData}
            onFieldChange={updateField}
            firms={firms}
            showFirmSelector={profile?.role === 'super_admin'}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
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
