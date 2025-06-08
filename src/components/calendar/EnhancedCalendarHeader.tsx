
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Plus, Settings, FileText, Repeat, Zap, Search, Filter } from "lucide-react";

interface EnhancedCalendarHeaderProps {
  onAddEvent: () => void;
  onAddRecurringEvent: () => void;
  onOpenTemplates: () => void;
  onOpenSmartScheduling: () => void;
  onOpenSettings: () => void;
  pendingSyncCount?: number;
}

export function EnhancedCalendarHeader({
  onAddEvent,
  onAddRecurringEvent,
  onOpenTemplates,
  onOpenSmartScheduling,
  onOpenSettings,
  pendingSyncCount = 0,
}: EnhancedCalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your appointments and schedule
            {pendingSyncCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingSyncCount} pending sync
              </Badge>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Smart Scheduling Button */}
        <Button
          variant="outline"
          onClick={onOpenSmartScheduling}
          className="hidden sm:flex"
        >
          <Zap className="h-4 w-4 mr-2" />
          Smart Schedule
        </Button>

        {/* Templates Button */}
        <Button
          variant="outline"
          onClick={onOpenTemplates}
          className="hidden sm:flex"
        >
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>

        {/* Add Event Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onAddEvent}>
              <Calendar className="h-4 w-4 mr-2" />
              Single Event
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddRecurringEvent}>
              <Repeat className="h-4 w-4 mr-2" />
              Recurring Event
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenTemplates}>
              <FileText className="h-4 w-4 mr-2" />
              From Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenSmartScheduling}>
              <Zap className="h-4 w-4 mr-2" />
              Smart Schedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Button */}
        <Button variant="outline" size="icon" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
