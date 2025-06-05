
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { AddEventDialog } from "@/components/calendar/AddEventDialog";
import { GoogleCalendarSettings } from "@/components/calendar/GoogleCalendarSettings";

const Calendar = () => {
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshEvents, setRefreshEvents] = useState(0);

  const handleEventAdded = () => {
    setRefreshEvents(prev => prev + 1);
    setAddEventOpen(false);
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
        onOpenChange={setSettingsOpen}
      />
    </SidebarProvider>
  );
};

export default Calendar;
