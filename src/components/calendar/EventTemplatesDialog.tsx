
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, Edit } from "lucide-react";

interface EventTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  duration_minutes: number;
  location?: string;
  event_type: string;
  default_attendees?: string[];
  created_at: string;
}

interface TemplateFormData {
  name: string;
  title: string;
  description: string;
  duration_minutes: number;
  location: string;
  event_type: string;
}

interface EventTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect?: (template: EventTemplate) => void;
}

export function EventTemplatesDialog({ open, onOpenChange, onTemplateSelect }: EventTemplatesDialogProps) {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);
  const { toast } = useToast();

  const form = useForm<TemplateFormData>({
    defaultValues: {
      name: "",
      title: "",
      description: "",
      duration_minutes: 60,
      location: "",
      event_type: "meeting",
    },
  });

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mock templates for now since we don't have the table yet
      const mockTemplates: EventTemplate[] = [
        {
          id: "1",
          name: "Client Consultation",
          title: "Client Consultation - {{client_name}}",
          description: "Initial consultation meeting with client to discuss case details",
          duration_minutes: 90,
          location: "Conference Room A",
          event_type: "consultation",
          default_attendees: [],
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Court Hearing",
          title: "Court Hearing - {{case_name}}",
          description: "Scheduled court appearance",
          duration_minutes: 120,
          location: "Courthouse",
          event_type: "court_hearing",
          default_attendees: [],
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Deposition",
          title: "Deposition - {{witness_name}}",
          description: "Witness deposition session",
          duration_minutes: 180,
          location: "Law Office",
          event_type: "deposition",
          default_attendees: [],
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Team Meeting",
          title: "Weekly Team Meeting",
          description: "Regular team sync and case updates",
          duration_minutes: 60,
          location: "Conference Room B",
          event_type: "internal_meeting",
          default_attendees: [],
          created_at: new Date().toISOString(),
        },
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load event templates",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (editingTemplate) {
        // Update existing template
        const updatedTemplate: EventTemplate = {
          ...editingTemplate,
          ...data,
        };
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        // Create new template
        const newTemplate: EventTemplate = {
          id: Date.now().toString(),
          ...data,
          default_attendees: [],
          created_at: new Date().toISOString(),
        };
        setTemplates(prev => [...prev, newTemplate]);
        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }

      form.reset();
      setShowForm(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const editTemplate = (template: EventTemplate) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      title: template.title,
      description: template.description || "",
      duration_minutes: template.duration_minutes,
      location: template.location || "",
      event_type: template.event_type,
    });
    setShowForm(true);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      consultation: "bg-blue-100 text-blue-800",
      court_hearing: "bg-red-100 text-red-800",
      deposition: "bg-purple-100 text-purple-800",
      internal_meeting: "bg-green-100 text-green-800",
      meeting: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.meeting;
  };

  if (showForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Event Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? "Update the event template" : "Create a reusable event template for common meetings"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client Consultation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title Template</FormLabel>
                    <FormControl>
                      <Input placeholder="Meeting with {{client_name}}" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Template description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          step="15" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="court_hearing">Court Hearing</SelectItem>
                          <SelectItem value="deposition">Deposition</SelectItem>
                          <SelectItem value="internal_meeting">Internal Meeting</SelectItem>
                          <SelectItem value="meeting">General Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Conference Room A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingTemplate(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Event Templates
          </DialogTitle>
          <DialogDescription>
            Select a template to create an event, or manage your custom templates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Available Templates</h3>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge className={getEventTypeColor(template.event_type)}>
                      {template.event_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.title}</p>
                  {template.description && (
                    <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Duration: {template.duration_minutes} min</span>
                    {template.location && <span>Location: {template.location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editTemplate(template)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  {onTemplateSelect && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onTemplateSelect(template);
                        onOpenChange(false);
                      }}
                    >
                      Use Template
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates found</p>
            <p className="text-sm mt-2">Create your first event template to get started</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
