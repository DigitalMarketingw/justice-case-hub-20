
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { AddEventDialog } from "@/components/calendar/AddEventDialog";
import { GoogleCalendarSettings } from "@/components/calendar/GoogleCalendarSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Calendar = () => {
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshEvents, setRefreshEvents] = useState(0);
  const { toast } = useToast();

  const handleEventAdded = async () => {
    setRefreshEvents(prev => prev + 1);
    setAddEventOpen(false);
    
    // Try to sync with Google Calendar if connected
    try {
      await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'sync_events' }
      });
    } catch (error) {
      // Silently fail if sync is not available or user not connected
      console.log('Google Calendar sync not available or failed:', error);
    }
  };

  const handleSettingsChanged = () => {
    // Refresh events when settings are changed (e.g., after connecting/disconnecting)
    setRefreshEvents(prev => prev + 1);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar />
        <main className="flex-1">
          <div className="p-6 space-y-6">
            <CalendarHeader 
              onAddEvent={() => setAddEventOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
            <CalendarView refreshTrigger={refreshEvents} />
          </div>
        </main>
      </div>

      <AddEventDialog 
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        onEventAdded={handleEventAdded}
      />

      <GoogleCalendarSettings
        open={settingsOpen}
        onOpenChange={(open) => {
          setSettingsOpen(open);
          if (!open) {
            handleSettingsChanged();
          }
        }}
      />
    </SidebarProvider>
  );
};

export default Calendar;
