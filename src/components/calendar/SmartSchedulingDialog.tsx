
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { SmartScheduling } from "./SmartScheduling";
import { useToast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";

interface SmartSchedulingFormData {
  title: string;
  description: string;
  duration: number;
  attendees: string;
  location: string;
}

interface SmartSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventScheduled: () => void;
}

export function SmartSchedulingDialog({ 
  open, 
  onOpenChange, 
  onEventScheduled 
}: SmartSchedulingDialogProps) {
  const [showScheduling, setShowScheduling] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<SmartSchedulingFormData>({
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      attendees: "",
      location: "",
    },
  });

  const handleCancel = () => {
    form.reset();
    setShowScheduling(false);
    setSelectedSlot(null);
    onOpenChange(false);
  };

  const onSubmit = (data: SmartSchedulingFormData) => {
    setShowScheduling(true);
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
  };

  const confirmScheduling = () => {
    if (!selectedSlot) return;

    const formData = form.getValues();
    
    console.log('Scheduling event:', {
      ...formData,
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
      confidence: selectedSlot.confidence,
    });

    toast({
      title: "Event Scheduled",
      description: `Event scheduled for ${new Date(selectedSlot.start).toLocaleString()}`,
    });

    form.reset();
    setShowScheduling(false);
    setSelectedSlot(null);
    onEventScheduled();
    onOpenChange(false);
  };

  const goBackToForm = () => {
    setShowScheduling(false);
    setSelectedSlot(null);
  };

  if (showScheduling) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Smart Scheduling - Select Time
            </DialogTitle>
            <DialogDescription>
              AI-suggested optimal times for "{form.getValues('title')}"
            </DialogDescription>
          </DialogHeader>

          <SmartScheduling
            duration={form.getValues('duration')}
            attendees={form.getValues('attendees').split(',').map(email => email.trim()).filter(Boolean)}
            onTimeSlotSelect={handleSlotSelect}
          />

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
              variant="outline"
              onClick={goBackToForm}
            >
              Back to Event Details
            </Button>
            <Button
              type="button"
              onClick={confirmScheduling}
              disabled={!selectedSlot}
            >
              Schedule Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Scheduling
          </DialogTitle>
          <DialogDescription>
            Let AI find the optimal time for your event based on availability and preferences.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Team meeting..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Event details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Conference Room A..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendees (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="email1@example.com, email2@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
          >
            Find Optimal Times
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
