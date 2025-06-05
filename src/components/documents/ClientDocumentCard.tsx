
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DocumentItem } from "./DocumentItem";

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

interface ClientDocumentCardProps {
  client: ClientWithDocuments;
  onUploadClick: (clientId: string) => void;
  onDocumentDeleted: () => void;
}

export function ClientDocumentCard({ client, onUploadClick, onDocumentDeleted }: ClientDocumentCardProps) {
  return (
    <Card>
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
            onClick={() => onUploadClick(client.id)}
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
              <DocumentItem
                key={doc.id}
                document={doc}
                onDocumentDeleted={onDocumentDeleted}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
