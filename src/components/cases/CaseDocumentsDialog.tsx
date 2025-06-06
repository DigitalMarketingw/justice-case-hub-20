
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  description?: string;
  file_path?: string;
}

interface CaseDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  clientId: string;
}

export function CaseDocumentsDialog({
  open,
  onOpenChange,
  caseId,
  clientId,
}: CaseDocumentsDialogProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [caseInfo, setCaseInfo] = useState<{
    title: string;
    case_number: string;
    client_name: string;
  } | null>(null);

  useEffect(() => {
    if (open && caseId && clientId) {
      fetchDocuments();
      fetchCaseInfo();
    }
  }, [open, caseId, clientId]);

  const fetchCaseInfo = async () => {
    try {
      // Get case info
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('title, case_number')
        .eq('id', caseId)
        .single();

      if (caseError) {
        console.error('Error fetching case info:', caseError);
        return;
      }

      // Get client info from profiles
      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error('Error fetching client info:', clientError);
        return;
      }

      setCaseInfo({
        title: caseData?.title || '',
        case_number: caseData?.case_number || '',
        client_name: clientData ? `${clientData.first_name} ${clientData.last_name}` : ''
      });
    } catch (error) {
      console.error('Error fetching case info:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, file_size, mime_type, created_at, description, file_path')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
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

  const handleView = async (document: Document) => {
    try {
      if (!document.file_path) return;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Case Documents</DialogTitle>
          <DialogDescription>
            {caseInfo ? (
              <>
                <strong>Case:</strong> {caseInfo.title} ({caseInfo.case_number})
                <br />
                <strong>Client:</strong> {caseInfo.client_name}
              </>
            ) : (
              'Loading case information...'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No documents found for this case</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
