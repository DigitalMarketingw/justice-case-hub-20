
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Calendar, RefreshCw, ArrowRightLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ReassignClientDialog } from "./ReassignClientDialog";
import { Button } from "@/components/ui/button";

interface DroppedClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dropped_date: string;
  dropped_by: string;
  dropper_name: string;
  transferred_from_firm_id?: string;
  transferred_date?: string;
  transferred_by?: string;
  transferred_firm_name?: string;
}

interface DroppedClientsSectionProps {
  onClientReassigned: () => void;
}

export function DroppedClientsSection({ onClientReassigned }: DroppedClientsSectionProps) {
  const [droppedClients, setDroppedClients] = useState<DroppedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.firm_id) {
      fetchDroppedClients();
    }
  }, [profile?.firm_id]);

  const fetchDroppedClients = async () => {
    if (!profile?.firm_id) return;

    setLoading(true);
    try {
      // First get the dropped clients
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, dropped_date, dropped_by, transferred_from_firm_id, transferred_date, transferred_by')
        .eq('role', 'client')
        .eq('firm_id', profile.firm_id)
        .eq('is_dropped', true)
        .order('dropped_date', { ascending: false });

      if (clientsError) throw clientsError;

      // Get the dropper names separately
      const dropperIds = [...new Set(clients?.map(c => c.dropped_by).filter(Boolean) || [])];
      const { data: droppers, error: droppersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', dropperIds);

      if (droppersError) throw droppersError;

      // Get transferred from firm names
      const fromFirmIds = [...new Set(clients?.map(c => c.transferred_from_firm_id).filter(Boolean) || [])];
      let fromFirmsMap = new Map();
      if (fromFirmIds.length > 0) {
        const { data: fromFirms, error: fromFirmsError } = await supabase
          .from('firms')
          .select('id, name')
          .in('id', fromFirmIds);

        if (fromFirmsError) throw fromFirmsError;
        fromFirmsMap = new Map(fromFirms?.map(f => [f.id, f.name]) || []);
      }

      // Map dropper names to clients
      const droppersMap = new Map(droppers?.map(d => [d.id, `${d.first_name} ${d.last_name}`]) || []);

      const transformedData: DroppedClient[] = (clients || []).map(client => ({
        ...client,
        dropper_name: droppersMap.get(client.dropped_by) || 'Unknown',
        transferred_firm_name: fromFirmsMap.get(client.transferred_from_firm_id) || undefined
      }));

      setDroppedClients(transformedData);
    } catch (error) {
      console.error('Error fetching dropped clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isTransferredClient = (client: DroppedClient) => {
    return !!client.transferred_from_firm_id;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dropped clients...</p>
        </CardContent>
      </Card>
    );
  }

  if (droppedClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dropped Clients (0)</span>
            <Button onClick={fetchDroppedClients} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No dropped clients</h3>
          <p className="text-gray-600">All clients are currently active and assigned.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Dropped Clients ({droppedClients.length})</span>
          <Button onClick={fetchDroppedClients} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Dropped Date</TableHead>
              <TableHead>Dropped By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {droppedClients.map((client) => (
              <TableRow key={client.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isTransferredClient(client) ? 'bg-orange-100' : 'bg-red-100'
                    }`}>
                      {isTransferredClient(client) ? (
                        <ArrowRightLeft className="h-5 w-5 text-orange-600" />
                      ) : (
                        <User className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </p>
                      {isTransferredClient(client) && client.transferred_firm_name && (
                        <p className="text-xs text-orange-600">
                          Transferred from {client.transferred_firm_name}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {client.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(client.dropped_date)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {client.dropper_name}
                </TableCell>
                <TableCell>
                  {isTransferredClient(client) ? (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Transferred
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Dropped</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <ReassignClientDialog
                    clientId={client.id}
                    clientName={`${client.first_name} ${client.last_name}`}
                    onClientReassigned={() => {
                      onClientReassigned();
                      fetchDroppedClients();
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
