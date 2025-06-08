
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EnhancedCalendarHeader } from "@/components/calendar/EnhancedCalendarHeader";
import { AddEventDialog } from "@/components/calendar/AddEventDialog";
import { RecurringEventDialog } from "@/components/calendar/RecurringEventDialog";
import { EventTemplatesDialog } from "@/components/calendar/EventTemplatesDialog";
import { SmartSchedulingDialog } from "@/components/calendar/SmartSchedulingDialog";
import { GoogleCalendarSettings } from "@/components/calendar/GoogleCalendarSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Calendar = () => {
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [recurringEventOpen, setRecurringEventOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [smartSchedulingOpen, setSmartSchedulingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshEvents, setRefreshEvents] = useState(0);
  const { toast } = useToast();

  const handleEventAdded = async () => {
    setRefreshEvents(prev => prev + 1);
    
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
            <EnhancedCalendarHeader 
              onAddEvent={() => setAddEventOpen(true)}
              onAddRecurringEvent={() => setRecurringEventOpen(true)}
              onOpenTemplates={() => setTemplatesOpen(true)}
              onOpenSmartScheduling={() => setSmartSchedulingOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              pendingSyncCount={0}
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

      <RecurringEventDialog
        open={recurringEventOpen}
        onOpenChange={setRecurringEventOpen}
        onEventsCreated={handleEventAdded}
      />

      <EventTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onTemplateSelect={(template) => {
          // When a template is selected, open the add event dialog with pre-filled data
          console.log('Template selected:', template);
          setTemplatesOpen(false);
          setAddEventOpen(true);
        }}
      />

      <SmartSchedulingDialog
        open={smartSchedulingOpen}
        onOpenChange={setSmartSchedulingOpen}
        onEventScheduled={handleEventAdded}
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
