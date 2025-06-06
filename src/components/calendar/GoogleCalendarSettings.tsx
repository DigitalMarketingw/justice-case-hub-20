
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Since google_calendar_settings table doesn't exist, we'll use mock data
      const mockSettings: GoogleCalendarSettings = {
        is_connected: false,
        sync_enabled: false,
      };

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching Google Calendar settings:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    setLoading(true);
    try {
      // Mock connection process
      toast({
        title: "Google Calendar",
        description: "Google Calendar integration is not yet implemented",
      });
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
      toast({
        title: "Google Calendar",
        description: "Google Calendar disconnected",
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
                  <Button 
                    variant="outline" 
                    onClick={disconnectGoogleCalendar}
                    disabled={loading}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    onClick={connectGoogleCalendar}
                    disabled={loading}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect Google Calendar
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
