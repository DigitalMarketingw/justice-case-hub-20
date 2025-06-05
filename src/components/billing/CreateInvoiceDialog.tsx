
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  client_id: string;
  due_date: string;
  tax_rate: number;
  notes: string;
  selectedHours: string[];
}

interface Client {
  id: string;
  full_name: string;
}

interface BillableHour {
  id: string;
  description: string;
  hours_worked: number;
  hourly_rate: number;
  total_amount: number;
  work_date: string;
  client: {
    full_name: string;
  };
}

export function CreateInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [unbilledHours, setUnbilledHours] = useState<BillableHour[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      client_id: "",
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      tax_rate: 0,
      notes: "",
      selectedHours: [],
    },
  });

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  useEffect(() => {
    if (selectedClient) {
      fetchUnbilledHours(selectedClient);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name')
        .eq('user_id', user.id)
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchUnbilledHours = async (clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('billable_hours')
        .select(`
          *,
          client:clients(full_name)
        `)
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .eq('is_invoiced', false)
        .order('work_date');

      if (error) throw error;
      setUnbilledHours(data || []);
    } catch (error) {
      console.error('Error fetching unbilled hours:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (data.selectedHours.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one billable hour entry",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate subtotal from selected hours
      const selectedHourObjects = unbilledHours.filter(hour => data.selectedHours.includes(hour.id));
      const subtotal = selectedHourObjects.reduce((sum, hour) => sum + Number(hour.total_amount), 0);

      // Generate invoice number
      const { data: invoiceNumber, error: numberError } = await supabase.rpc('generate_invoice_number');
      if (numberError) throw numberError;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: data.client_id,
          invoice_number: invoiceNumber,
          due_date: data.due_date,
          tax_rate: data.tax_rate,
          subtotal: subtotal,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create line items for each selected billable hour
      const lineItems = selectedHourObjects.map(hour => ({
        invoice_id: invoice.id,
        billable_hour_id: hour.id,
        description: hour.description,
        quantity: hour.hours_worked,
        rate: hour.hourly_rate,
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);

      if (lineItemsError) throw lineItemsError;

      toast({
        title: "Success",
        description: `Invoice ${invoiceNumber} created successfully`,
      });

      form.reset();
      setSelectedClient("");
      setUnbilledHours([]);
      setOpen(false);
      window.location.reload(); // Refresh to show new data
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    form.setValue('client_id', clientId);
    form.setValue('selectedHours', []);
  };

  const calculateTotal = () => {
    const selectedHourObjects = unbilledHours.filter(hour => 
      form.watch('selectedHours').includes(hour.id)
    );
    const subtotal = selectedHourObjects.reduce((sum, hour) => sum + Number(hour.total_amount), 0);
    const taxAmount = subtotal * (form.watch('tax_rate') / 100);
    return subtotal + taxAmount;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Generate an invoice from unbilled hours for a client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={handleClientChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedClient && unbilledHours.length > 0 && (
              <FormField
                control={form.control}
                name="selectedHours"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Billable Hours to Invoice</FormLabel>
                    <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                      {unbilledHours.map((hour) => (
                        <FormField
                          key={hour.id}
                          control={form.control}
                          name="selectedHours"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(hour.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, hour.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== hour.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none flex-1">
                                <FormLabel className="text-sm font-normal">
                                  {hour.description} - {hour.hours_worked}h @ ${hour.hourly_rate}/h = ${hour.total_amount}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedClient && unbilledHours.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No unbilled hours found for this client.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        max="100"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes for the invoice..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('selectedHours').length > 0 && (
              <div className="border-t pt-4">
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Total: ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={loading || form.watch('selectedHours').length === 0}>
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
