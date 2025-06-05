import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UploadDocumentDialog } from "./UploadDocumentDialog";

interface Client {
  id: string;
  full_name: string;
  email: string;
  company_name?: string;
}

interface DocumentFile {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  upload_date: string;
  description?: string;
  tags?: string[];
}

interface ClientWithDocuments extends Client {
  documents: DocumentFile[];
  documentCount: number;
}

export function ClientDocuments() {
  const [clientsWithDocuments, setClientsWithDocuments] = useState<ClientWithDocuments[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const fetchClientsWithDocuments = async () => {
    try {
      setLoading(true);
      
      // First get all clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, full_name, email, company_name')
        .order('full_name');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return;
      }

      // Then get documents for each client
      const clientsWithDocs: ClientWithDocuments[] = await Promise.all(
        (clients || []).map(async (client) => {
          const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('id, file_name, file_size, file_type, file_path, upload_date, description, tags')
            .eq('client_id', client.id)
            .order('upload_date', { ascending: false });

          if (docsError) {
            console.error('Error fetching documents for client:', client.id, docsError);
          }

          return {
            ...client,
            documents: documents || [],
            documentCount: documents?.length || 0
          };
        })
      );

      // Filter to only show clients that have documents or match search
      const filteredClients = clientsWithDocs.filter(client => 
        client.documentCount > 0 || 
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setClientsWithDocuments(filteredClients);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsWithDocuments();
  }, [searchTerm]);

  const handleDownloadDocument = async (document: DocumentFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) {
        console.error('Error downloading file:', error);
        return;
      }

      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        return;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return;
      }

      // Refresh the data
      fetchClientsWithDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients with Documents */}
      <div className="grid gap-6">
        {clientsWithDocuments.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {client.full_name}
                    <Badge variant="secondary">{client.documentCount} documents</Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    <p>{client.email}</p>
                    {client.company_name && <p>{client.company_name}</p>}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setIsUploadDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {client.documents.length === 0 ? (
                <p className="text-gray-500 italic">No documents uploaded for this client</p>
              ) : (
                <div className="space-y-3">
                  {client.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>{doc.file_type}</span>
                            <span>{formatDate(doc.upload_date)}</span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          )}
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {doc.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {clientsWithDocuments.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-gray-600">Start by uploading documents for your clients.</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        preselectedClientId={selectedClientId}
        onDocumentUploaded={() => {
          fetchClientsWithDocuments();
          setSelectedClientId(null);
        }}
      />
    </div>
  );
}
