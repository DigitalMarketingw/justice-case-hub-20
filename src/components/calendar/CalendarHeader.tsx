
import { Button } from "@/components/ui/button";
import { Plus, Settings, Calendar } from "lucide-react";

interface CalendarHeaderProps {
  onAddEvent: () => void;
  onOpenSettings: () => void;
}

export function CalendarHeader({ onAddEvent, onOpenSettings }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Calendar
        </h1>
        <p className="text-gray-600">Manage your appointments and meetings</p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onOpenSettings}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Google Calendar
        </Button>
        <Button 
          onClick={onAddEvent}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>
    </div>
  );
}
