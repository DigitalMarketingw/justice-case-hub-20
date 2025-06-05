
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { useDocumentActions } from "@/hooks/useDocumentActions";

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

interface DocumentItemProps {
  document: DocumentFile;
  onDocumentDeleted: () => void;
}

export function DocumentItem({ document, onDocumentDeleted }: DocumentItemProps) {
  const { handleDownloadDocument, handleDeleteDocument, formatFileSize, formatDate } = useDocumentActions();

  const handleDelete = async () => {
    const success = await handleDeleteDocument(document.id, document.file_path);
    if (success) {
      onDocumentDeleted();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <FileText className="h-5 w-5 text-blue-500" />
        <div>
          <p className="font-medium">{document.file_name}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{formatFileSize(document.file_size)}</span>
            <span>{document.file_type}</span>
            <span>{formatDate(document.upload_date)}</span>
          </div>
          {document.description && (
            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
          )}
          {document.tags && document.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {document.tags.map((tag, index) => (
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
          onClick={() => handleDownloadDocument(document)}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
