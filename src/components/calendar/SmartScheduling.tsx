
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Users, Zap, Settings } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
  confidence: number;
  reasons: string[];
  conflicts: number;
}

interface SmartSchedulingProps {
  duration: number;
  attendees?: string[];
  preferredTimeRanges?: { start: string; end: string }[];
  onTimeSlotSelect: (slot: TimeSlot) => void;
}

export function SmartScheduling({ 
  duration, 
  attendees = [], 
  preferredTimeRanges = [],
  onTimeSlotSelect 
}: SmartSchedulingProps) {
  const [suggestedSlots, setSuggestedSlots] = useState<TimeSlot[]>([]);
  const [preferences, setPreferences] = useState({
    workingHoursStart: "09:00",
    workingHoursEnd: "17:00",
    preferredDays: ["1", "2", "3", "4", "5"], // Monday to Friday
    bufferTime: 15, // minutes
    avoidLunchTime: true,
  });
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks
  });

  useEffect(() => {
    generateSmartSuggestions();
  }, [duration, attendees, preferences, dateRange]);

  const generateSmartSuggestions = () => {
    const slots: TimeSlot[] = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate && slots.length < 10) {
      const dayOfWeek = currentDate.getDay().toString();
      
      // Skip weekends if not in preferred days
      if (!preferences.preferredDays.includes(dayOfWeek)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Generate time slots for this day
      const daySlots = generateDaySlots(new Date(currentDate));
      slots.push(...daySlots);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sort by confidence score (highest first)
    slots.sort((a, b) => b.confidence - a.confidence);
    
    setSuggestedSlots(slots.slice(0, 6)); // Show top 6 suggestions
  };

  const generateDaySlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const workStart = parseInt(preferences.workingHoursStart.split(':')[0]);
    const workEnd = parseInt(preferences.workingHoursEnd.split(':')[0]);
    
    // Generate hourly slots within working hours
    for (let hour = workStart; hour < workEnd; hour++) {
      // Skip lunch time if preference is set
      if (preferences.avoidLunchTime && hour >= 12 && hour < 13) {
        continue;
      }
      
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + duration);
      
      // Don't suggest slots that go beyond working hours
      if (endTime.getHours() > workEnd) {
        continue;
      }
      
      const slot = analyzeTimeSlot(startTime, endTime);
      if (slot.confidence > 0.3) { // Only include decent confidence slots
        slots.push(slot);
      }
    }
    
    return slots;
  };

  const analyzeTimeSlot = (start: Date, end: Date): TimeSlot => {
    let confidence = 0.8; // Base confidence
    const reasons: string[] = [];
    let conflicts = 0;
    
    // Time-based scoring
    const hour = start.getHours();
    
    // Morning slots get higher confidence
    if (hour >= 9 && hour <= 11) {
      confidence += 0.1;
      reasons.push("Optimal morning time");
    }
    
    // Afternoon but not too late
    if (hour >= 14 && hour <= 16) {
      confidence += 0.05;
      reasons.push("Good afternoon slot");
    }
    
    // Avoid very early or very late
    if (hour < 8 || hour > 17) {
      confidence -= 0.2;
      reasons.push("Outside preferred hours");
    }
    
    // Day of week scoring
    const dayOfWeek = start.getDay();
    if (dayOfWeek >= 2 && dayOfWeek <= 4) { // Tue-Thu
      confidence += 0.1;
      reasons.push("Mid-week optimal");
    }
    
    if (dayOfWeek === 1 || dayOfWeek === 5) { // Mon or Fri
      confidence -= 0.05;
      reasons.push("Monday/Friday");
    }
    
    // Mock conflict detection
    if (Math.random() > 0.7) {
      conflicts = Math.floor(Math.random() * 2) + 1;
      confidence -= conflicts * 0.15;
      reasons.push(`${conflicts} potential conflict(s)`);
    }
    
    // Buffer time consideration
    if (preferences.bufferTime > 0) {
      reasons.push(`${preferences.bufferTime}min buffer included`);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      confidence: Math.max(0, Math.min(1, confidence)),
      reasons,
      conflicts,
    };
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    let dayLabel = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    
    if (date.toDateString() === today.toDateString()) {
      dayLabel = "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayLabel = "Tomorrow";
    }
    
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { dayLabel, time };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "Excellent";
    if (confidence >= 0.6) return "Good";
    return "Fair";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scheduling Preferences */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="workingStart">Working Hours Start</Label>
              <Input
                id="workingStart"
                type="time"
                value={preferences.workingHoursStart}
                onChange={(e) => setPreferences(prev => ({ ...prev, workingHoursStart: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="workingEnd">Working Hours End</Label>
              <Input
                id="workingEnd"
                type="time"
                value={preferences.workingHoursEnd}
                onChange={(e) => setPreferences(prev => ({ ...prev, workingHoursEnd: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dateStart">Search From</Label>
              <Input
                id="dateStart"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dateEnd">Search Until</Label>
              <Input
                id="dateEnd"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          {/* Suggested Time Slots */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Suggested Time Slots</h3>
            <div className="grid gap-3">
              {suggestedSlots.map((slot, index) => {
                const startTime = formatDateTime(slot.start);
                const endTime = formatDateTime(slot.end);
                
                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onTimeSlotSelect(slot)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-sm font-medium">{startTime.dayLabel}</div>
                          <div className="text-lg font-bold">
                            {startTime.time} - {endTime.time}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getConfidenceColor(slot.confidence)}>
                            {getConfidenceLabel(slot.confidence)} ({Math.round(slot.confidence * 100)}%)
                          </Badge>
                          {slot.conflicts > 0 && (
                            <Badge variant="destructive">
                              {slot.conflicts} conflict{slot.conflicts > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {slot.reasons.map((reason, reasonIndex) => (
                        <span
                          key={reasonIndex}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {suggestedSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No suitable time slots found</p>
                <p className="text-sm mt-2">Try adjusting your preferences or date range</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
