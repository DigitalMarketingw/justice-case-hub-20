
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsTable } from "./DocumentsTable";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { DocumentsStats } from "./DocumentsStats";
import { ClientDocuments } from "./ClientDocuments";

export function DocumentsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDocumentUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents Management</h1>
          <p className="text-gray-600">Upload and manage client documents</p>
        </div>
      </div>

      <DocumentsStats />

      <Tabs defaultValue="by-client" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-client">Documents by Client</TabsTrigger>
          <TabsTrigger value="all-documents">All Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="by-client" className="space-y-4">
          <ClientDocuments />
        </TabsContent>

        <TabsContent value="all-documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Documents</CardTitle>
                  <CardDescription>View and manage all uploaded documents</CardDescription>
                </div>
                <UploadDocumentDialog onDocumentUploaded={handleDocumentUploaded} />
              </div>
            </CardHeader>
            <CardContent>
              <DocumentsTable 
                searchTerm={searchTerm}
                selectedClient={selectedClient}
                refreshTrigger={refreshTrigger}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
