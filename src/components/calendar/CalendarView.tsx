
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventParticipants } from "./components/EventParticipants";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  event_type?: string;
  is_google_synced?: boolean;
  client_id?: string;
  attorney_id?: string;
  case_id?: string;
  created_by: string;
  participants?: {
    participant_id: string;
    participant_type: string;
    status: string;
    participant: {
      first_name: string;
      last_name: string;
      email: string;
      role: string;
    };
  }[];
  attorney?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  client?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  creator?: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

interface CalendarViewProps {
  refreshTrigger: number;
}

export function CalendarView({ refreshTrigger }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setEvents([]);
        return;
      }

      console.log('Fetching events for user:', user.id);

      // Fetch events with basic information for now
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        console.error('User ID:', user.id);
        console.error('Error details:', error.details, error.hint);
        toast({
          title: "Error",
          description: `Failed to load calendar events: ${error.message}`,
          variant: "destructive",
        });
        setEvents([]);
        return;
      }

      console.log('Successfully fetched events:', data?.length || 0, 'events');
      setEvents(data || []);
    } catch (error) {
      console.error('Unexpected error fetching events:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred while loading events",
        variant: "destructive",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const upcomingEvents = events.filter(event => isUpcoming(event.start_time));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading calendar events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
              <p className="text-sm mt-2">Click "Add Event" to create your first event</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                 <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                   <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                     <div className="flex-1 min-w-0">
                       <h3 className="font-semibold text-lg text-gray-900 truncate">{event.title}</h3>
                       {event.description && (
                         <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                       )}
                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                         <div className="flex items-center gap-1">
                           <Clock className="h-4 w-4 flex-shrink-0" />
                           <span className="truncate">
                             {formatDate(event.start_time)} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                           </span>
                         </div>
                       </div>
                       
                       {/* Event Participants */}
                       <EventParticipants 
                         eventId={event.id}
                         attorneyId={event.attorney_id}
                         clientId={event.client_id}
                         createdBy={event.created_by}
                       />
                       
                       <div className="flex flex-wrap gap-2 mt-3">
                         {event.event_type && (
                           <Badge variant="secondary" className="text-xs">{event.event_type}</Badge>
                         )}
                         {event.location && (
                           <Badge variant="outline" className="text-xs">📍 {event.location}</Badge>
                         )}
                         {event.is_google_synced && (
                           <Badge variant="outline" className="text-xs text-green-600">
                             📅 Google Synced
                           </Badge>
                         )}
                         {event.attendees && event.attendees.length > 0 && (
                           <Badge variant="outline" className="text-xs">
                             <Users className="h-3 w-3 mr-1" />
                             {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                           </Badge>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {events.length > upcomingEvents.length && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Past Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.filter(event => !isUpcoming(event.start_time)).slice(0, 5).map((event) => (
                <div key={event.id} className="border rounded-lg p-4 opacity-75 hover:opacity-90 transition-opacity">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {formatDate(event.start_time)} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Event Participants */}
                      <EventParticipants 
                        eventId={event.id}
                        attorneyId={event.attorney_id}
                        clientId={event.client_id}
                        createdBy={event.created_by}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
