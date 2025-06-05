
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BillableHour {
  id: string;
  description: string;
  hours_worked: number;
  hourly_rate: number;
  total_amount: number;
  work_date: string;
  is_billable: boolean;
  is_invoiced: boolean;
  client: {
    full_name: string;
  };
  attorney?: {
    full_name: string;
  };
}

export function BillableHoursTable() {
  const [billableHours, setBillableHours] = useState<BillableHour[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillableHours();
  }, []);

  const fetchBillableHours = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('billable_hours')
        .select(`
          *,
          client:clients(full_name),
          attorney:attorneys(full_name)
        `)
        .eq('user_id', user.id)
        .order('work_date', { ascending: false });

      if (error) throw error;
      setBillableHours(data || []);
    } catch (error) {
      console.error('Error fetching billable hours:', error);
      toast({
        title: "Error",
        description: "Failed to fetch billable hours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBillableHour = async (id: string) => {
    try {
      const { error } = await supabase
        .from('billable_hours')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBillableHours(prev => prev.filter(hour => hour.id !== id));
      toast({
        title: "Success",
        description: "Billable hour deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting billable hour:', error);
      toast({
        title: "Error",
        description: "Failed to delete billable hour",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading billable hours...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Attorney</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billableHours.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                No billable hours found
              </TableCell>
            </TableRow>
          ) : (
            billableHours.map((hour) => (
              <TableRow key={hour.id}>
                <TableCell>{format(new Date(hour.work_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{hour.client?.full_name}</TableCell>
                <TableCell>{hour.attorney?.full_name || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">{hour.description}</TableCell>
                <TableCell>{hour.hours_worked}</TableCell>
                <TableCell>${hour.hourly_rate}</TableCell>
                <TableCell>${hour.total_amount}</TableCell>
                <TableCell>
                  <Badge variant={hour.is_invoiced ? "default" : "secondary"}>
                    {hour.is_invoiced ? "Invoiced" : "Unbilled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteBillableHour(hour.id)}
                      disabled={hour.is_invoiced}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
