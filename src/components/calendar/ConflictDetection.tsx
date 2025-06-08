
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, Users, Calendar } from "lucide-react";

interface ConflictEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
}

interface ConflictDetectionProps {
  proposedEvent: {
    start_time: string;
    end_time: string;
    attendees?: string[];
    location?: string;
  };
  excludeEventId?: string;
  onConflictsDetected?: (conflicts: ConflictEvent[]) => void;
}

export function ConflictDetection({ 
  proposedEvent, 
  excludeEventId, 
  onConflictsDetected 
}: ConflictDetectionProps) {
  const [conflicts, setConflicts] = useState<ConflictEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (proposedEvent.start_time && proposedEvent.end_time) {
      detectConflicts();
    }
  }, [proposedEvent.start_time, proposedEvent.end_time, proposedEvent.attendees, proposedEvent.location]);

  const detectConflicts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mock conflict detection since we don't have the calendar_events table
      // In a real implementation, this would query overlapping events
      const mockConflicts: ConflictEvent[] = [];

      // Simulate time-based conflicts
      const proposedStart = new Date(proposedEvent.start_time);
      const proposedEnd = new Date(proposedEvent.end_time);
      
      // Mock existing event that might conflict
      const existingEventStart = new Date(proposedStart);
      existingEventStart.setHours(proposedStart.getHours() - 1);
      const existingEventEnd = new Date(proposedStart);
      existingEventEnd.setHours(proposedStart.getHours() + 1);

      // Check for time overlap
      if (proposedStart < existingEventEnd && proposedEnd > existingEventStart) {
        mockConflicts.push({
          id: "conflict-1",
          title: "Client Meeting - John Doe",
          start_time: existingEventStart.toISOString(),
          end_time: existingEventEnd.toISOString(),
          location: proposedEvent.location,
          attendees: ["john@example.com"],
        });
      }

      setConflicts(mockConflicts);
      onConflictsDetected?.(mockConflicts);
    } catch (error) {
      console.error('Error detecting conflicts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlternativeTimes = () => {
    const alternatives = [];
    const proposedStart = new Date(proposedEvent.start_time);
    const duration = new Date(proposedEvent.end_time).getTime() - proposedStart.getTime();

    // Generate 3 alternative time slots
    for (let i = 1; i <= 3; i++) {
      const newStart = new Date(proposedStart.getTime() + (i * 60 * 60 * 1000)); // Add hours
      const newEnd = new Date(newStart.getTime() + duration);
      
      alternatives.push({
        start: newStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: newEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startDateTime: newStart.toISOString(),
        endDateTime: newEnd.toISOString(),
      });
    }

    return alternatives;
  };

  const getConflictType = (conflict: ConflictEvent) => {
    const types = [];
    
    // Time overlap
    types.push("Time Overlap");
    
    // Location conflict
    if (conflict.location === proposedEvent.location && proposedEvent.location) {
      types.push("Location Conflict");
    }
    
    // Attendee conflict
    if (conflict.attendees && proposedEvent.attendees) {
      const commonAttendees = conflict.attendees.filter(attendee => 
        proposedEvent.attendees?.includes(attendee)
      );
      if (commonAttendees.length > 0) {
        types.push("Attendee Conflict");
      }
    }
    
    return types;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4 animate-spin" />
        Checking for conflicts...
      </div>
    );
  }

  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Calendar className="h-4 w-4" />
        No conflicts detected
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{conflicts.length} conflict(s) detected:</p>
            {conflicts.map((conflict, index) => (
              <div key={conflict.id} className="border-l-2 border-red-300 pl-3 ml-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{conflict.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(conflict.start_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(conflict.end_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {getConflictType(conflict).map((type) => (
                      <Badge key={type} variant="destructive" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          {showSuggestions ? "Hide" : "Show"} Alternative Times
        </Button>
      </div>

      {showSuggestions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Suggested Alternative Times:
          </h4>
          <div className="space-y-2">
            {generateAlternativeTimes().map((alt, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-white rounded p-2 border"
              >
                <span className="text-sm">
                  {alt.start} - {alt.end}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // This would typically update the parent form
                    console.log('Selected alternative time:', alt);
                  }}
                >
                  Use This Time
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
