
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { User, Mail, Phone, Building, MoreHorizontal, RefreshCw, UserCheck } from "lucide-react";
import { DropClientDialog } from "./DropClientDialog";
import { TransferClientDialog } from "./TransferClientDialog";
import { ReassignClientDialog } from "./ReassignClientDialog";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  is_dropped: boolean;
  dropped_date?: string;
  assigned_attorney_id?: string;
  assigned_attorney_name?: string;
  firm_id?: string;
  firm_name?: string;
  created_by_name?: string;
  last_login?: string;
  is_active: boolean;
}

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onRefresh: () => void;
}

export function ClientsTable({ clients, loading, onRefresh }: ClientsTableProps) {
  const { profile } = useAuth();
  const isFirmAdmin = profile?.role === 'firm_admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';
  
  // Filter out dropped clients - they'll be shown in the dropped section
  const activeClients = clients.filter(client => !client.is_dropped);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (client: Client) => {
    if (!client.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!client.last_login) {
      return <Badge variant="outline">Never Logged In</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading clients...</p>
        </CardContent>
      </Card>
    );
  }

  if (activeClients.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active clients found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first client.</p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Clients ({activeClients.length})</span>
          <Button onClick={onRefresh} variant="outline" size="sm">
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
              {isSuperAdmin && <TableHead>Firm</TableHead>}
              <TableHead>Assigned Attorney</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              {isFirmAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeClients.map((client) => (
              <TableRow key={client.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.full_name}</p>
                      {client.created_by_name && (
                        <p className="text-xs text-gray-500">Added by {client.created_by_name}</p>
                      )}
                      {client.tags && client.tags.length > 0 && (
                        <div className="flex space-x-1 mt-1">
                          {client.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {client.phone}
                      </div>
                    )}
                    {client.company_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        {client.company_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    {client.firm_name ? (
                      <span className="text-sm text-gray-900">{client.firm_name}</span>
                    ) : (
                      <span className="text-gray-400">No Firm</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {client.assigned_attorney_name ? (
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm text-gray-900">{client.assigned_attorney_name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(client)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(client.created_at)}
                </TableCell>
                {isFirmAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <ReassignClientDialog
                        clientId={client.id}
                        clientName={client.full_name}
                        currentAttorneyId={client.assigned_attorney_id}
                        onClientReassigned={onRefresh}
                      />
                      {isFirmAdmin && (
                        <DropClientDialog
                          clientId={client.id}
                          clientName={client.full_name}
                          onClientDropped={onRefresh}
                        />
                      )}
                      {isSuperAdmin && profile?.firm_id && (
                        <TransferClientDialog
                          clientId={client.id}
                          clientName={client.full_name}
                          currentFirmId={client.firm_id || ''}
                          onClientTransferred={onRefresh}
                        />
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
