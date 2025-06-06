
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Calendar, RefreshCw } from "lucide-react";
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
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          dropped_date,
          dropped_by,
          dropper:dropped_by(first_name, last_name)
        `)
        .eq('role', 'client')
        .eq('firm_id', profile.firm_id)
        .eq('is_dropped', true)
        .order('dropped_date', { ascending: false });

      if (error) throw error;

      const transformedData: DroppedClient[] = (data || []).map(client => ({
        ...client,
        dropper_name: client.dropper ? 
          `${client.dropper.first_name} ${client.dropper.last_name}` : 
          'Unknown'
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
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </p>
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
                  <Badge variant="destructive">Dropped</Badge>
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
