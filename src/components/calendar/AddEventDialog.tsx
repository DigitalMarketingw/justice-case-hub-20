
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEventForm } from "./hooks/useEventForm";
import { EventFormFields } from "./components/EventFormFields";
import { createCalendarEvent } from "./utils/eventApi";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventAdded: () => void;
}

export function AddEventDialog({ open, onOpenChange, onEventAdded }: AddEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { form, clients, attorneys, fetchClients, fetchAttorneys, resetForm } = useEventForm();

  useEffect(() => {
    if (open) {
      fetchClients();
      fetchAttorneys();
    }
  }, [open]);

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createCalendarEvent(data);

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      resetForm();
      onEventAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>
            Create a new calendar event for your law practice.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <EventFormFields 
              control={form.control}
              clients={clients}
              attorneys={attorneys}
            />
          </form>
        </Form>
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
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
