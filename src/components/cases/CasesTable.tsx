
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, MoreHorizontal, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CaseDocumentsDialog } from "./CaseDocumentsDialog";

interface Case {
  id: string;
  title: string;
  casenumber: string;
  status: string;
  casetype: string;
  description?: string;
  opendate: string;
  courtdate?: string;
  clientid: string;
  clients?: {
    full_name: string;
    email: string;
  };
}

interface CasesTableProps {
  searchTerm: string;
}

export function CasesTable({ searchTerm }: CasesTableProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const fetchCases = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('cases')
        .select(`
          *,
          clients!inner(
            full_name,
            email
          )
        `)
        .order('opendate', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,casenumber.ilike.%${searchTerm}%,clients.full_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cases:', error);
        return;
      }

      setCases(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDocuments = (caseId: string, clientId: string) => {
    setSelectedCaseId(caseId);
    setSelectedClientId(clientId);
    setDocumentsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case Title</TableHead>
            <TableHead>Case Number</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Open Date</TableHead>
            <TableHead>Court Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No cases found
              </TableCell>
            </TableRow>
          ) : (
            cases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell className="font-medium">{caseItem.title}</TableCell>
                <TableCell>{caseItem.casenumber}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{caseItem.clients?.full_name}</div>
                    <div className="text-sm text-gray-500">{caseItem.clients?.email}</div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{caseItem.casetype}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(caseItem.status)}>
                    {caseItem.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(caseItem.opendate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {caseItem.courtdate ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {format(new Date(caseItem.courtdate), 'MMM dd, yyyy')}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not scheduled</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDocuments(caseItem.id, caseItem.clientid)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <CaseDocumentsDialog
        open={documentsDialogOpen}
        onOpenChange={setDocumentsDialogOpen}
        caseId={selectedCaseId}
        clientId={selectedClientId}
      />
    </>
  );
}
