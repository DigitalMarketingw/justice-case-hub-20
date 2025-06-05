
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AttorneyDashboard = () => {
  const { profile, signOut, user, loading: authLoading } = useAuth();
  const [clientCount, setClientCount] = useState(0);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('AttorneyDashboard - Auth state:', {
    user: user?.email,
    profile: profile?.role,
    authLoading,
    profileId: profile?.id
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log('AttorneyDashboard - Starting data fetch');
      
      if (authLoading) {
        console.log('AttorneyDashboard - Auth still loading, waiting...');
        return;
      }

      if (!user) {
        console.log('AttorneyDashboard - No user found');
        setError('No user found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Get attorney details
        console.log('AttorneyDashboard - Fetching attorney data for profile:', profile?.id);
        
        if (profile?.id) {
          const { data: attorneyData, error: attorneyError } = await supabase
            .from('attorneys')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
            
          console.log('AttorneyDashboard - Attorney data result:', { attorneyData, attorneyError });
            
          if (attorneyError) {
            console.log('AttorneyDashboard - No attorney record found, this might be normal for demo users');
            // Don't treat this as an error for demo purposes
          }
          
          if (attorneyData) {
            // Count assigned clients
            const { count: clientCount, error: clientError } = await supabase
              .from('clients')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_attorney_id', attorneyData.id);
              
            if (!clientError) {
              setClientCount(clientCount || 0);
            }
            
            // Count unread messages
            const { count: messageCount, error: messageError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('recipient_id', profile.id)
              .eq('is_read', false);
              
            if (!messageError) {
              setPendingMessages(messageCount || 0);
            }
            
            // Count upcoming calendar events
            const today = new Date();
            const { count: eventCount, error: eventError } = await supabase
              .from('calendar_events')
              .select('*', { count: 'exact', head: true })
              .eq('attorney_id', attorneyData.id)
              .gte('start_time', today.toISOString());
              
            if (!eventError) {
              setUpcomingEvents(eventCount || 0);
            }
          }
        }
      } catch (err) {
        console.error('AttorneyDashboard - Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile, user, authLoading]);

  // Show loading while auth is loading
  if (authLoading) {
    console.log('AttorneyDashboard - Rendering auth loading state');
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an authentication error
  if (error) {
    console.log('AttorneyDashboard - Rendering error state:', error);
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  console.log('AttorneyDashboard - Rendering main dashboard');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Attorney Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {profile?.first_name || user?.email?.split('@')[0] || 'Attorney'}
                {profile?.last_name && ` ${profile.last_name}`}
              </p>
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
