
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
import { User, Mail, Phone, Building, RefreshCw, Users, DollarSign } from "lucide-react";
import { AddAttorneyDialog } from "./AddAttorneyDialog";
import { useAuth } from "@/contexts/AuthContext";

interface Attorney {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  bar_number?: string;
  specialization?: string[];
  years_of_experience?: number;
  hourly_rate?: number;
  firm_name?: string;
  client_count?: number;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

interface AttorneysTableProps {
  attorneys: Attorney[];
  loading: boolean;
  onRefresh: () => void;
}

export function AttorneysTable({ attorneys, loading, onRefresh }: AttorneysTableProps) {
  const { profile } = useAuth();
  const isFirmAdmin = profile?.role === 'firm_admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (attorney: Attorney) => {
    if (!attorney.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!attorney.last_login) {
      return <Badge variant="outline">Never Logged In</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading attorneys...</p>
        </CardContent>
      </Card>
    );
  }

  if (attorneys.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No attorneys found</h3>
          <p className="text-gray-600 mb-4">
            {isFirmAdmin ? "Get started by adding your first attorney." : "No attorneys available in your scope."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {isFirmAdmin && <AddAttorneyDialog onAttorneyAdded={onRefresh} />}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attorneys ({attorneys.length})</span>
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {isFirmAdmin && <AddAttorneyDialog onAttorneyAdded={onRefresh} />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attorney</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Professional Info</TableHead>
              {isSuperAdmin && <TableHead>Firm</TableHead>}
              <TableHead>Clients</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attorneys.map((attorney) => (
              <TableRow key={attorney.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{attorney.full_name}</p>
                      {attorney.specialization && attorney.specialization.length > 0 && (
                        <div className="flex space-x-1 mt-1">
                          {attorney.specialization.slice(0, 2).map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
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
                      {attorney.email}
                    </div>
                    {attorney.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {attorney.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {attorney.bar_number && (
                      <p className="text-sm text-gray-600">Bar: {attorney.bar_number}</p>
                    )}
                    {attorney.years_of_experience && (
                      <p className="text-sm text-gray-600">
                        {attorney.years_of_experience} years experience
                      </p>
                    )}
                  </div>
                </TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    {attorney.firm_name ? (
                      <div className="flex items-center text-sm">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {attorney.firm_name}
                      </div>
                    ) : (
                      <span className="text-gray-400">No Firm</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{attorney.client_count || 0} clients</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                    <span>{formatCurrency(attorney.hourly_rate)}/hr</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(attorney)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(attorney.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
