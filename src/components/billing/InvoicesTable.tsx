
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  created_at: string;
  due_date: string;
  status: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  client: {
    first_name: string;
    last_name: string;
  };
}

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:profiles!invoices_client_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      // Generate PDF content
      const invoiceContent = generateInvoicePDF(invoice);
      
      // Create blob and download
      const blob = new Blob([invoiceContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${invoice.invoice_number}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .invoice-details { margin-bottom: 30px; }
        .client-details { margin-bottom: 30px; }
        .line-items { width: 100%; border-collapse: collapse; }
        .line-items th, .line-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .line-items th { background-color: #f2f2f2; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAWerp500</h1>
        <h2>Invoice</h2>
    </div>
    
    <div class="invoice-details">
        <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
        <p><strong>Invoice Date:</strong> ${format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
        <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
        <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
    </div>
    
    <div class="client-details">
        <h3>Bill To:</h3>
        <p>${invoice.client.first_name} ${invoice.client.last_name}</p>
    </div>
    
    <div class="totals">
        <p>Subtotal: $${invoice.amount.toFixed(2)}</p>
        ${invoice.tax_amount > 0 ? `<p>Tax: $${invoice.tax_amount.toFixed(2)}</p>` : ''}
        <p class="total-row">Total: $${invoice.total_amount.toFixed(2)}</p>
    </div>
</body>
</html>
    `;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading invoices...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>
                  {invoice.client ? 
                    `${invoice.client.first_name} ${invoice.client.last_name}` : 
                    'Unknown Client'
                  }
                </TableCell>
                <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(invoice.status)}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
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
