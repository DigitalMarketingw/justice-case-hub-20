
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClientForm } from "./hooks/useClientForm";
import { ClientFormFields } from "./components/ClientFormFields";
import { fetchAttorneys, createClient } from "./utils/clientApi";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    formData,
    resetForm,
    updateField,
    isFormValid,
    firmId
  } = useClientForm();

  useEffect(() => {
    if (isOpen && firmId) {
      loadAttorneys();
    }
  }, [isOpen, firmId]);

  const loadAttorneys = async () => {
    if (!firmId) return;
    
    try {
      const attorneysData = await fetchAttorneys(firmId);
      setAttorneys(attorneysData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    console.log('Dialog open state changing to:', open);
    setIsOpen(open);
    if (!open) {
      console.log('Dialog closing - resetting form');
      resetForm();
    }
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isFormValid()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and ensure password is at least 8 characters",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    if (!firmId) {
      toast({
        title: "Error",
        description: "No firm associated with your account",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createClient(formData, firmId, user.id, toast);
      
      // Close dialog and refresh data
      setIsOpen(false);

      if (onClientAdded) {
        onClientAdded();
      }
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile || !['super_admin', 'firm_admin'].includes(profile.role)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ClientFormFields
            formData={formData}
            attorneys={attorneys}
            onFieldChange={updateField}
          />
        </div>
        <DialogFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? "Creating Client..." : "Create Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
