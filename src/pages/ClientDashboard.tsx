
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, MessageSquare, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface CaseData {
  id: string;
  title: string;
  case_number: string;
  status: string;
  created_at: string;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClientData();
      fetchCases();
    }
  }, [user]);

  const fetchClientData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching client data:', error);
        return;
      }

      setClientData(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, case_number, status, created_at')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cases:', error);
        return;
      }

      setCases(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Client Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {clientData?.first_name}! Here's an overview of your cases.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Contact your attorney
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <FileText className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold">Documents</h3>
                  <p className="text-sm text-gray-600 text-center">
                    View case documents
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold">Appointments</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Schedule meetings
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <User className="h-8 w-8 text-orange-600 mb-2" />
                  <h3 className="font-semibold">Profile</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Update information
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cases Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Your Cases</CardTitle>
                <CardDescription>
                  Overview of all your legal cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : cases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">No cases found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                              <h4 className="font-medium">{caseItem.title}</h4>
                              <p className="text-sm text-gray-500">
                                Case #{caseItem.case_number}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusBadge(caseItem.status)}>
                            {caseItem.status.replace('_', ' ')}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ClientDashboard;
