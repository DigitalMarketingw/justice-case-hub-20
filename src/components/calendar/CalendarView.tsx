
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  event_type?: string;
  client_id?: string;
  attorney_id?: string;
  is_google_synced?: boolean;
}

interface CalendarViewProps {
  refreshTrigger: number;
}

export function CalendarView({ refreshTrigger }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [currentDate, refreshTrigger]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .order('start_time');

      if (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load calendar events.",
          variant: "destructive",
        });
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  const getSelectedDateEvents = () => {
    return getEventsForDate(selectedDate);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map(date => {
                const dayEvents = getEventsForDate(date);
                const isSelected = isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, currentDate);
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                      ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}
                      ${!isCurrentMonth ? 'text-gray-400' : ''}
                    `}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="font-medium text-sm mb-1">
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getSelectedDateEvents().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No events scheduled for this date
              </p>
            ) : (
              getSelectedDateEvents().map(event => (
                <div key={event.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{event.title}</h3>
                    {event.is_google_synced && (
                      <Badge variant="secondary" className="text-xs">
                        Google
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(event.start_time), 'h:mm a')} - 
                    {format(new Date(event.end_time), 'h:mm a')}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}

                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {event.attendees.length} attendee(s)
                    </div>
                  )}

                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {event.description}
                    </p>
                  )}

                  {event.event_type && (
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
