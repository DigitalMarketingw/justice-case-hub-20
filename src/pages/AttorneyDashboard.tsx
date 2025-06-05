
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AttorneyDashboard = () => {
  const { profile, signOut } = useAuth();
  const [clientCount, setClientCount] = useState(0);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      
      // Get attorney details
      const { data: attorneyData } = await supabase
        .from('attorneys')
        .select('id')
        .eq('profile_id', profile.id)
        .single();
        
      if (attorneyData) {
        // Count assigned clients
        const { count: clientCount, error: clientError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_attorney_id', attorneyData.id);
          
        if (clientError) {
          console.error('Error fetching clients:', clientError);
        } else {
          setClientCount(clientCount || 0);
        }
        
        // Count unread messages
        const { count: messageCount, error: messageError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', profile.id)
          .eq('is_read', false);
          
        if (messageError) {
          console.error('Error fetching messages:', messageError);
        } else {
          setPendingMessages(messageCount || 0);
        }
        
        // Count upcoming calendar events
        const today = new Date();
        const { count: eventCount, error: eventError } = await supabase
          .from('calendar_events')
          .select('*', { count: 'exact', head: true })
          .eq('attorney_id', attorneyData.id)
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
              <h1 className="text-3xl font-bold">Attorney Dashboard</h1>
              <p className="text-gray-600">Welcome, {profile?.first_name} {profile?.last_name}</p>
            </div>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : clientCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : pendingMessages}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : upcomingEvents}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Billable Hours</CardTitle>
                <CardDescription>Track your work for clients</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Record billable hours for your assigned clients.</p>
                <Button>Log Hours</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Documents</CardTitle>
                <CardDescription>View and manage client documents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Access and upload documents for your clients.</p>
                <Button>View Documents</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AttorneyDashboard;
