import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventParticipant {
  participant_id: string;
  participant_type: string;
  status: string;
  participant: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

interface EventParticipantsProps {
  eventId: string;
  attorneyId?: string;
  clientId?: string;
  createdBy: string;
}

export function EventParticipants({ eventId, attorneyId, clientId, createdBy }: EventParticipantsProps) {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [attorneyName, setAttorneyName] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipantDetails();
  }, [eventId, attorneyId, clientId]);

  const fetchParticipantDetails = async () => {
    try {
      setLoading(true);

      // Fetch attorney name if specified
      if (attorneyId) {
        const { data: attorney } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', attorneyId)
          .single();
        
        if (attorney) {
          setAttorneyName(`${attorney.first_name || ''} ${attorney.last_name || ''}`.trim());
        }
      }

      // Fetch client name if specified
      if (clientId) {
        const { data: client } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', clientId)
          .single();
        
        if (client) {
          setClientName(`${client.first_name || ''} ${client.last_name || ''}`.trim());
        }
      }

      // Fetch event participants for status tracking
      const { data: participantData } = await supabase
        .from('calendar_event_participants')
        .select(`
          participant_id,
          participant_type,
          status
        `)
        .eq('event_id', eventId);

      if (participantData) {
        setParticipants(participantData as EventParticipant[]);
      }
    } catch (error) {
      console.error('Error fetching participant details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <UserCheck className="h-3 w-3 text-green-600" />;
      case 'declined':
        return <UserX className="h-3 w-3 text-red-600" />;
      default:
        return <Users className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declined':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <div className="text-xs text-gray-500">Loading participants...</div>;
  }

  const hasParticipants = attorneyName || clientName;

  if (!hasParticipants) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1">
        {attorneyName && (
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(
              participants.find(p => p.participant_id === attorneyId)?.status || 'pending'
            )}`}
          >
            {getStatusIcon(participants.find(p => p.participant_id === attorneyId)?.status || 'pending')}
            <span className="ml-1">👨‍💼 {attorneyName}</span>
          </Badge>
        )}
        {clientName && (
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(
              participants.find(p => p.participant_id === clientId)?.status || 'pending'
            )}`}
          >
            {getStatusIcon(participants.find(p => p.participant_id === clientId)?.status || 'pending')}
            <span className="ml-1">👤 {clientName}</span>
          </Badge>
        )}
      </div>
    </div>
  );
}