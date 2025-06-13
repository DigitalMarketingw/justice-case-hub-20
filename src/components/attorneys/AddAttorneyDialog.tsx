
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
  const [internalOpen, setInternalOpen] = useState(false);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { formData, resetForm, updateField } = useAttorneyForm();

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const fetchFirms = async () => {
      if (!isOpen) return;

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
  }, [isOpen, profile]);

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleSubmit = async () => {
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
      setIsOpen(false);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {open === undefined && (
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
        <div className="space-y-4">
          <AttorneyFormFields
            formData={formData}
            onFieldChange={updateField}
            firms={firms}
            showFirmSelector={profile?.role === 'super_admin'}
          />
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Attorney..." : "Create Attorney"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
