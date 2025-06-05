
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, CheckCircle, AlertCircle } from "lucide-react";

interface GoogleCalendarSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GoogleCalendarSettings {
  id: string;
  google_calendar_id?: string;
  is_connected: boolean;
  token_expires_at?: string;
}

export function GoogleCalendarSettings({ open, onOpenChange }: GoogleCalendarSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<GoogleCalendarSettings | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('google_calendar_settings')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Google Calendar settings:', error);
        toast({
          title: "Error",
          description: "Failed to load Google Calendar settings.",
          variant: "destructive",
        });
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setConnecting(true);
      
      // Call the edge function to initiate Google OAuth
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'connect' }
      });

      if (error) {
        console.error('Error connecting to Google Calendar:', error);
        toast({
          title: "Error",
          description: "Failed to connect to Google Calendar. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.authUrl) {
        // Open Google OAuth in a new window
        window.open(data.authUrl, 'google-auth', 'width=500,height=600');
        
        // Listen for the completion of the auth flow
        const checkAuthStatus = setInterval(async () => {
          const { data: statusData } = await supabase.functions.invoke('google-calendar-auth', {
            body: { action: 'check_status' }
          });
          
          if (statusData?.connected) {
            clearInterval(checkAuthStatus);
            toast({
              title: "Success",
              description: "Google Calendar connected successfully!",
            });
            fetchSettings(); // Refresh settings
          }
        }, 2000);

        // Stop checking after 5 minutes
        setTimeout(() => clearInterval(checkAuthStatus), 5 * 60 * 1000);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'disconnect' }
      });

      if (error) {
        console.error('Error disconnecting Google Calendar:', error);
        toast({
          title: "Error",
          description: "Failed to disconnect Google Calendar.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Google Calendar disconnected successfully.",
      });
      
      fetchSettings(); // Refresh settings
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEvents = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'sync_events' }
      });

      if (error) {
        console.error('Error syncing events:', error);
        toast({
          title: "Error",
          description: "Failed to sync events with Google Calendar.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Events synced with Google Calendar successfully!",
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </DialogTitle>
          <DialogDescription>
            Connect your Google Calendar to sync events and appointments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && !settings ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Connection Status
                  {settings?.is_connected ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings?.is_connected ? (
                  <>
                    <div className="space-y-2">
                      {settings.google_calendar_id && (
                        <p className="text-sm text-gray-600">
                          <strong>Calendar ID:</strong> {settings.google_calendar_id}
                        </p>
                      )}
                      {settings.token_expires_at && (
                        <p className="text-sm text-gray-600">
                          <strong>Token Expires:</strong> {new Date(settings.token_expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSyncEvents}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sync Events
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDisconnectGoogle}
                        disabled={loading}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Connect your Google Calendar to automatically sync events between this application and your Google Calendar.
                    </p>
                    
                    <Button
                      onClick={handleConnectGoogle}
                      disabled={connecting}
                      className="w-full"
                    >
                      {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Connect Google Calendar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Sync events between this app and Google Calendar</li>
                <li>• Automatic two-way synchronization</li>
                <li>• Import existing Google Calendar events</li>
                <li>• Export new events to Google Calendar</li>
                <li>• Real-time updates and notifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
