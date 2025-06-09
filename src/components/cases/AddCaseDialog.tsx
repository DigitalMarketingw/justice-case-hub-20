
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCaseForm } from "./hooks/useCaseForm";
import { CaseFormFields } from "./components/CaseFormFields";
import { createCase } from "./utils/caseApi";

interface AddCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCaseDialog({ open, onOpenChange }: AddCaseDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { form, clients, fetchClients, resetForm } = useCaseForm();

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createCase(data);

      toast({
        title: "Success",
        description: "Case created successfully",
      });

      resetForm();
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: "Failed to create case",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Case</DialogTitle>
          <DialogDescription>
            Create a new legal case and assign it to a client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CaseFormFields 
              control={form.control}
              clients={clients}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={() => form.handleSubmit(onSubmit)()} disabled={loading}>
                {loading ? "Creating..." : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
