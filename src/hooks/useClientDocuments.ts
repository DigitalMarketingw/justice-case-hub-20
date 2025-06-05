
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function useClientDocuments(searchTerm: string) {
  const [clientsWithDocuments, setClientsWithDocuments] = useState<ClientWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);

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

  return {
    clientsWithDocuments,
    loading,
    refetchClients: fetchClientsWithDocuments
  };
}
