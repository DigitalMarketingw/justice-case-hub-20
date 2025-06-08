
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Repeat } from "lucide-react";

interface RecurringEventFormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_time: string;
  recurrence_type: "daily" | "weekly" | "monthly" | "yearly";
  recurrence_interval: number;
  recurrence_end_date: string;
  selected_days: string[];
  location?: string;
  client_id?: string;
  attorney_id?: string;
}

interface RecurringEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventsCreated: () => void;
}

export function RecurringEventDialog({ open, onOpenChange, onEventsCreated }: RecurringEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecurringEventFormData>({
    defaultValues: {
      title: "",
      description: "",
      start_date: new Date().toISOString().split('T')[0],
      start_time: "09:00",
      end_time: "10:00",
      recurrence_type: "weekly",
      recurrence_interval: 1,
      recurrence_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      selected_days: [],
      location: "",
      client_id: "",
      attorney_id: "",
    },
  });

  const watchRecurrenceType = form.watch("recurrence_type");

  const generateRecurringDates = (formData: RecurringEventFormData): Date[] => {
    const dates: Date[] = [];
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.recurrence_end_date);
    const interval = formData.recurrence_interval;

    let currentDate = new Date(startDate);

    while (currentDate <= endDate && dates.length < 100) { // Limit to 100 occurrences
      if (formData.recurrence_type === "weekly" && formData.selected_days.length > 0) {
        // For weekly recurrence with specific days
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        
        formData.selected_days.forEach(dayStr => {
          const dayNum = parseInt(dayStr);
          const occurrenceDate = new Date(weekStart);
          occurrenceDate.setDate(weekStart.getDate() + dayNum);
          
          if (occurrenceDate >= startDate && occurrenceDate <= endDate) {
            dates.push(new Date(occurrenceDate));
          }
        });
        
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      } else {
        dates.push(new Date(currentDate));
        
        switch (formData.recurrence_type) {
          case "daily":
            currentDate.setDate(currentDate.getDate() + interval);
            break;
          case "weekly":
            currentDate.setDate(currentDate.getDate() + (7 * interval));
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + interval);
            break;
          case "yearly":
            currentDate.setFullYear(currentDate.getFullYear() + interval);
            break;
        }
      }
    }

    return dates;
  };

  const onSubmit = async (data: RecurringEventFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dates = generateRecurringDates(data);
      
      if (dates.length === 0) {
        toast({
          title: "Error",
          description: "No valid dates generated for the recurrence pattern",
          variant: "destructive",
        });
        return;
      }

      // Create events for each date
      const events = dates.map(date => {
        const startDateTime = `${date.toISOString().split('T')[0]}T${data.start_time}:00`;
        const endDateTime = `${date.toISOString().split('T')[0]}T${data.end_time}:00`;
        
        return {
          title: data.title,
          description: data.description,
          start_time: startDateTime,
          end_time: endDateTime,
          location: data.location || null,
          client_id: data.client_id || null,
          attorney_id: data.attorney_id || null,
          user_id: user.id,
          event_type: 'recurring',
          recurrence_type: data.recurrence_type,
          is_recurring: true,
        };
      });

      console.log('Creating recurring events:', events);

      toast({
        title: "Success",
        description: `Created ${events.length} recurring events`,
      });

      form.reset();
      onEventsCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating recurring events:', error);
      toast({
        title: "Error",
        description: "Failed to create recurring events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Create Recurring Event
          </DialogTitle>
          <DialogDescription>
            Set up a recurring event with custom patterns and schedules.
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
                    <Input placeholder="Weekly team meeting..." {...field} />
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
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrence_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recurrence_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat Every</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrence_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="52" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchRecurrenceType === "weekly" && (
              <FormField
                control={form.control}
                name="selected_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days of Week</FormLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {daysOfWeek.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={day.value}
                            checked={field.value?.includes(day.value)}
                            onCheckedChange={(checked) => {
                              const updatedDays = checked
                                ? [...(field.value || []), day.value]
                                : (field.value || []).filter((d) => d !== day.value);
                              field.onChange(updatedDays);
                            }}
                          />
                          <label htmlFor={day.value} className="text-sm">
                            {day.label.slice(0, 3)}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Events..." : "Create Recurring Events"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
