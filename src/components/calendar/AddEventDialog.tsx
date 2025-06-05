
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventAdded: () => void;
}

interface Client {
  id: string;
  full_name: string;
}

interface Attorney {
  id: string;
  full_name: string;
}

export function AddEventDialog({ open, onOpenChange, onEventAdded }: AddEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type: "meeting",
    client_id: "",
    attorney_id: "",
    attendees: "",
  });

  useEffect(() => {
    if (open) {
      fetchClientsAndAttorneys();
      // Set default times (current time + 1 hour)
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setFormData(prev => ({
        ...prev,
        start_time: now.toISOString().slice(0, 16),
        end_time: oneHourLater.toISOString().slice(0, 16),
      }));
    }
  }, [open]);

  const fetchClientsAndAttorneys = async () => {
    try {
      const [clientsResponse, attorneysResponse] = await Promise.all([
        supabase.from('clients').select('id, full_name').order('full_name'),
        supabase.from('attorneys').select('id, full_name').order('full_name')
      ]);

      if (clientsResponse.error) {
        console.error('Error fetching clients:', clientsResponse.error);
      } else {
        setClients(clientsResponse.data || []);
      }

      if (attorneysResponse.error) {
        console.error('Error fetching attorneys:', attorneysResponse.error);
      } else {
        setAttorneys(attorneysResponse.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendeesArray = formData.attendees 
        ? formData.attendees.split(',').map(email => email.trim()).filter(Boolean)
        : [];

      const eventData = {
        title: formData.title,
        description: formData.description || null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || null,
        event_type: formData.event_type,
        client_id: formData.client_id || null,
        attorney_id: formData.attorney_id || null,
        attendees: attendeesArray.length > 0 ? attendeesArray : null,
      };

      const { error } = await supabase
        .from('calendar_events')
        .insert([eventData]);

      if (error) {
        console.error('Error adding event:', error);
        toast({
          title: "Error",
          description: "Failed to add event. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Event added successfully!",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        event_type: "meeting",
        client_id: "",
        attorney_id: "",
        attendees: "",
      });

      onEventAdded();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Schedule a new appointment or meeting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event_type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => handleInputChange("event_type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="court">Court Hearing</SelectItem>
                  <SelectItem value="deposition">Deposition</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time" className="text-right">
                Start Time *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">
                End Time *
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange("end_time", e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="col-span-3"
                placeholder="Office, Court Room, etc."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client_id" className="text-right">
                Client
              </Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleInputChange("client_id", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attorney_id" className="text-right">
                Attorney
              </Label>
              <Select
                value={formData.attorney_id}
                onValueChange={(value) => handleInputChange("attorney_id", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an attorney (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {attorneys.map((attorney) => (
                    <SelectItem key={attorney.id} value={attorney.id}>
                      {attorney.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendees" className="text-right">
                Attendees
              </Label>
              <Input
                id="attendees"
                value={formData.attendees}
                onChange={(e) => handleInputChange("attendees", e.target.value)}
                className="col-span-3"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="col-span-3"
                rows={3}
                placeholder="Event details, agenda, notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
