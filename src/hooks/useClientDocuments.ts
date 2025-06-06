
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface DocumentFile {
  id: string;
  name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  created_at: string;
  description?: string;
}

interface ClientWithDocuments extends Client {
  full_name: string;
  documents: DocumentFile[];
  documentCount: number;
}

export function useClientDocuments(searchTerm: string) {
  const [clientsWithDocuments, setClientsWithDocuments] = useState<ClientWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientsWithDocuments = async () => {
    try {
      setLoading(true);
      
      // First get all clients from profiles
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'client')
        .order('first_name');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return;
      }

      // Then get documents for each client
      const clientsWithDocs: ClientWithDocuments[] = await Promise.all(
        (clients || []).map(async (client) => {
          const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('id, name, file_size, mime_type, file_path, created_at, description')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

          if (docsError) {
            console.error('Error fetching documents for client:', client.id, docsError);
          }

          return {
            ...client,
            full_name: `${client.first_name} ${client.last_name}`,
            documents: documents || [],
            documentCount: documents?.length || 0
          };
        })
      );

      // Filter to only show clients that have documents or match search
      const filteredClients = clientsWithDocs.filter(client => 
        client.documentCount > 0 || 
        client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
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
