
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useClientDocuments } from "@/hooks/useClientDocuments";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { ClientSearchBar } from "./ClientSearchBar";
import { ClientDocumentCard } from "./ClientDocumentCard";

export function ClientDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const { clientsWithDocuments, loading, refetchClients } = useClientDocuments(searchTerm);

  const handleUploadClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsUploadDialogOpen(true);
  };

  const handleDocumentUploaded = () => {
    refetchClients();
    setSelectedClientId(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ClientSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="grid gap-6">
        {clientsWithDocuments.map((client) => (
          <ClientDocumentCard
            key={client.id}
            client={client}
            onUploadClick={handleUploadClick}
            onDocumentDeleted={refetchClients}
          />
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

      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        preselectedClientId={selectedClientId}
        onDocumentUploaded={handleDocumentUploaded}
      />
    </div>
  );
}
