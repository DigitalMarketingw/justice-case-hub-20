
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ClientAttorney {
  attorney_name: string;
  attorney_email: string;
  attorney_phone: string | null;
}

const ClientDashboard = () => {
  const { profile, signOut } = useAuth();
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [attorneyInfo, setAttorneyInfo] = useState<ClientAttorney | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      
      // Get client record
      const { data: clientData } = await supabase
        .from('clients')
        .select(`
          id,
          assigned_attorney_id,
          attorneys:assigned_attorney_id (
            full_name,
            email,
            phone
          )
        `)
        .eq('profile_id', profile.id)
        .single();
        
      if (clientData) {
        // Set attorney info
        if (clientData.attorneys) {
          setAttorneyInfo({
            attorney_name: clientData.attorneys.full_name,
            attorney_email: clientData.attorneys.email,
            attorney_phone: clientData.attorneys.phone,
          });
        }
        
        // Count pending invoices
        const { count: invoiceCount, error: invoiceError } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientData.id)
          .in('status', ['draft', 'sent']);
          
        if (invoiceError) {
          console.error('Error fetching invoices:', invoiceError);
        } else {
          setPendingInvoices(invoiceCount || 0);
        }
        
        // Count unread messages
        const { count: messageCount, error: messageError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientData.id)
          .eq('recipient_id', profile.id)
          .eq('is_read', false);
          
        if (messageError) {
          console.error('Error fetching messages:', messageError);
        } else {
          setUnreadMessages(messageCount || 0);
        }
        
        // Count upcoming calendar events
        const today = new Date();
        const { count: eventCount, error: eventError } = await supabase
          .from('calendar_events')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientData.id)
          .gte('start_time', today.toISOString());
          
        if (eventError) {
          console.error('Error fetching events:', eventError);
        } else {
          setUpcomingEvents(eventCount || 0);
        }
      }
      
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Client Dashboard</h1>
              <p className="text-gray-600">Welcome, {profile?.first_name} {profile?.last_name}</p>
            </div>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>

          {/* Attorney Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Attorney</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : attorneyInfo ? (
                <div>
                  <p className="font-medium">{attorneyInfo.attorney_name}</p>
                  <p className="text-gray-600">{attorneyInfo.attorney_email}</p>
                  {attorneyInfo.attorney_phone && <p className="text-gray-600">{attorneyInfo.attorney_phone}</p>}
                </div>
              ) : (
                <p>No attorney assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : pendingInvoices}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : unreadMessages}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : upcomingEvents}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communicate with your attorney</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View and send messages to your attorney.</p>
                <Button>Open Messages</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>Access your case documents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View and upload documents related to your case.</p>
                <Button>View Documents</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ClientDashboard;
