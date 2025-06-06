
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GoogleCalendarSettings {
  is_connected: boolean;
  calendar_id?: string;
  sync_enabled: boolean;
  last_sync?: string;
}

interface GoogleCalendarSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleCalendarSettings({ open, onOpenChange }: GoogleCalendarSettingsProps) {
  const [settings, setSettings] = useState<GoogleCalendarSettings>({
    is_connected: false,
    sync_enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  useEffect(() => {
    // Listen for messages from the OAuth popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'google-auth-success') {
        console.log('Google auth success received');
        fetchSettings();
        toast({
          title: "Success",
          description: "Google Calendar connected successfully!",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'check_status' }
      });

      if (error) {
        console.error('Error checking connection status:', error);
        return;
      }

      setSettings({
        is_connected: data.connected || false,
        sync_enabled: data.connected || false,
      });
    } catch (error) {
      console.error('Error fetching Google Calendar settings:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'connect' }
      });

      if (error) {
        console.error('Error getting auth URL:', error);
        toast({
          title: "Error",
          description: "Failed to connect to Google Calendar",
          variant: "destructive",
        });
        return;
      }

      if (data.authUrl) {
        // Open popup window for OAuth
        const popup = window.open(
          data.authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Check if popup was blocked
        if (!popup) {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site and try again",
            variant: "destructive",
          });
          return;
        }

        // Monitor popup closure
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Give a short delay for message to be processed
            setTimeout(fetchSettings, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'disconnect' }
      });

      if (error) {
        console.error('Error disconnecting:', error);
        toast({
          title: "Error",
          description: "Failed to disconnect Google Calendar",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Google Calendar disconnected successfully",
      });
      
      setSettings({
        is_connected: false,
        sync_enabled: false,
      });
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncEvents = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'sync_events' }
      });

      if (error) {
        console.error('Error syncing events:', error);
        toast({
          title: "Error",
          description: "Failed to sync events with Google Calendar",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Events synced successfully with Google Calendar",
      });

      // Update last sync time
      setSettings(prev => ({
        ...prev,
        last_sync: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error syncing events:', error);
      toast({
        title: "Error",
        description: "Failed to sync events with Google Calendar",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Settings
          </DialogTitle>
          <DialogDescription>
            Manage your Google Calendar integration to sync events automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connection Status</CardTitle>
              <CardDescription>
                {settings.is_connected 
                  ? "Your Google Calendar is connected and syncing."
                  : "Connect your Google Calendar to sync events automatically."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={settings.is_connected ? "default" : "secondary"}>
                    {settings.is_connected ? "Connected" : "Not Connected"}
                  </Badge>
                  {settings.sync_enabled && (
                    <Badge variant="outline">Sync Enabled</Badge>
                  )}
                </div>
                {settings.is_connected ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={syncEvents}
                      disabled={syncing}
                    >
                      {syncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {syncing ? "Syncing..." : "Sync Now"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={disconnectGoogleCalendar}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disconnect"}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={connectGoogleCalendar}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Connecting..." : "Connect Google Calendar"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {settings.is_connected && settings.last_sync && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Last Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {new Date(settings.last_sync).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          {settings.is_connected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sync Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Events created in this calendar will be synced to Google Calendar</p>
                <p>• Events from Google Calendar will be imported automatically</p>
                <p>• Changes made in either calendar will be reflected in both</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
