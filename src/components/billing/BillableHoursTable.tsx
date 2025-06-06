
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
  date_worked: string;
  is_billable: boolean;
  case: {
    title: string;
    case_number: string;
    client: {
      first_name: string;
      last_name: string;
    };
  };
  attorney: {
    first_name: string;
    last_name: string;
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
        .from('billing_entries')
        .select(`
          *,
          case:cases(
            title,
            case_number,
            client:profiles!cases_client_id_fkey(first_name, last_name)
          ),
          attorney:profiles!billing_entries_attorney_id_fkey(first_name, last_name)
        `)
        .order('date_worked', { ascending: false });

      if (error) throw error;
      setBillableHours(data || []);
    } catch (error) {
      console.error('Error fetching billing entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch billing entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBillableHour = async (id: string) => {
    try {
      const { error } = await supabase
        .from('billing_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBillableHours(prev => prev.filter(hour => hour.id !== id));
      toast({
        title: "Success",
        description: "Billing entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting billing entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete billing entry",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading billing entries...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Case</TableHead>
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
              <TableCell colSpan={10} className="text-center py-4 text-gray-500">
                No billing entries found
              </TableCell>
            </TableRow>
          ) : (
            billableHours.map((hour) => (
              <TableRow key={hour.id}>
                <TableCell>{format(new Date(hour.date_worked), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{hour.case?.case_number}</div>
                    <div className="text-sm text-gray-500">{hour.case?.title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {hour.case?.client ? 
                    `${hour.case.client.first_name} ${hour.case.client.last_name}` : 
                    '-'
                  }
                </TableCell>
                <TableCell>
                  {hour.attorney ? 
                    `${hour.attorney.first_name} ${hour.attorney.last_name}` : 
                    '-'
                  }
                </TableCell>
                <TableCell className="max-w-xs truncate">{hour.description}</TableCell>
                <TableCell>{hour.hours_worked}</TableCell>
                <TableCell>${hour.hourly_rate}</TableCell>
                <TableCell>${hour.total_amount}</TableCell>
                <TableCell>
                  <Badge variant={hour.is_billable ? "default" : "secondary"}>
                    {hour.is_billable ? "Billable" : "Non-billable"}
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
