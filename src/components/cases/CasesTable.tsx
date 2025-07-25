
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
import { CaseDetailsDialog } from "./CaseDetailsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DropCaseDialog } from "./DropCaseDialog";

interface Case {
  id: string;
  title: string;
  case_number: string;
  status: string;
  case_type: string;
  description?: string;
  created_at: string;
  court_date?: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
}

interface CasesTableProps {
  searchTerm: string;
}

export function CasesTable({ searchTerm }: CasesTableProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const { profile, loading: authLoading } = useAuth();

  const fetchCases = async () => {
    try {
      setLoading(true);
      
      // First get cases
      let casesQuery = supabase
        .from('cases')
        .select('*')
        .eq('is_dropped', false)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        casesQuery = casesQuery.or(`title.ilike.%${searchTerm}%,case_number.ilike.%${searchTerm}%`);
      }

      const { data: casesData, error: casesError } = await casesQuery;

      if (casesError) {
        console.error('Error fetching cases:', casesError);
        return;
      }

      if (!casesData || casesData.length === 0) {
        setCases([]);
        return;
      }

      // Get client details for each case from profiles
      const clientIds = casesData.map(c => c.client_id);
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', clientIds);

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        setCases(casesData.map(caseItem => ({ 
          ...caseItem, 
          client_name: 'Unknown', 
          client_email: '' 
        })));
        return;
      }

      // Combine cases with client data
      const casesWithClients = casesData.map(caseItem => {
        const client = clientsData?.find(c => c.id === caseItem.client_id);
        return {
          ...caseItem,
          client_name: client ? `${client.first_name} ${client.last_name}` : 'Unknown',
          client_email: client?.email || ''
        };
      });

      // Apply search filter for client names if needed
      let filteredCases = casesWithClients;
      if (searchTerm) {
        filteredCases = casesWithClients.filter(caseItem => 
          caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (caseItem.client_name && caseItem.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setCases(filteredCases);
    } catch (error) {
      console.error('Error:', error);
      setCases([]);
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

  const handleViewDetails = (caseId: string) => {
    setSelectedCaseId(caseId);
    setDetailsDialogOpen(true);
  };

  // Safely check if user can drop cases, handling case where profile is undefined
  const canDropCases = profile?.role === 'firm_admin' || profile?.role === 'case_manager' || profile?.role === 'super_admin';

  // Early return if auth is still loading
  if (authLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

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
            <TableHead>Created Date</TableHead>
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
                <TableCell>{caseItem.case_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{caseItem.client_name}</div>
                    <div className="text-sm text-gray-500">{caseItem.client_email}</div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{caseItem.case_type}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(caseItem.status)}>
                    {caseItem.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(caseItem.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {caseItem.court_date ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {format(new Date(caseItem.court_date), 'MMM dd, yyyy')}
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
                      <DropdownMenuItem onClick={() => handleViewDocuments(caseItem.id, caseItem.client_id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDetails(caseItem.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {canDropCases && (
                    <DropCaseDialog
                      caseId={caseItem.id}
                      caseTitle={caseItem.title}
                      onCaseDropped={fetchCases}
                    />
                  )}
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

      <CaseDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        caseId={selectedCaseId}
      />
    </>
  );
}
