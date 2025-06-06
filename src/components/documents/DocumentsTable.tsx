
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, MoreHorizontal } from "lucide-react";
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

interface DocumentFile {
  id: string;
  name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  description?: string;
  client_name?: string;
  file_path?: string;
}

interface DocumentsTableProps {
  searchTerm: string;
  selectedClient: string;
  refreshTrigger: number;
}

export function DocumentsTable({ searchTerm, selectedClient, refreshTrigger }: DocumentsTableProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('documents')
        .select('id, name, file_size, mime_type, created_at, description, file_path, client_id')
        .order('created_at', { ascending: false });

      if (selectedClient) {
        query = query.eq('client_id', selectedClient);
      }

      const { data: documentsData, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
        return;
      }

      if (!documentsData || documentsData.length === 0) {
        setDocuments([]);
        return;
      }

      // Get client names from profiles
      const clientIds = [...new Set(documentsData.map(doc => doc.client_id).filter(Boolean))];
      let clientsData: any[] = [];
      
      if (clientIds.length > 0) {
        const { data, error: clientsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', clientIds);

        if (!clientsError) {
          clientsData = data || [];
        }
      }

      // Combine documents with client names
      const documentsWithClients = documentsData.map(doc => {
        const client = clientsData.find(c => c.id === doc.client_id);
        return {
          ...doc,
          client_name: client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'
        };
      });

      // Apply search filter
      let filteredDocuments = documentsWithClients;
      if (searchTerm) {
        filteredDocuments = documentsWithClients.filter(doc =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doc.client_name && doc.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setDocuments(filteredDocuments);
    } catch (error) {
      console.error('Error:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, selectedClient, refreshTrigger]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return 'bg-red-100 text-red-800';
    if (mimeType?.includes('image')) return 'bg-green-100 text-green-800';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleDownload = async (document: DocumentFile) => {
    try {
      if (!document.file_path) return;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) {
        console.error('Error downloading file:', error);
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No documents found
            </TableCell>
          </TableRow>
        ) : (
          documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    {doc.description && (
                      <div className="text-sm text-gray-500">{doc.description}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{doc.client_name}</TableCell>
              <TableCell>
                <Badge className={getFileTypeColor(doc.mime_type)}>
                  {doc.mime_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>{formatFileSize(doc.file_size)}</TableCell>
              <TableCell>
                {format(new Date(doc.created_at), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(doc)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
