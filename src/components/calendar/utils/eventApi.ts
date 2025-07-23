
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  client_id?: string;
  attorney_id?: string;
  case_id?: string;
}

export const createCalendarEvent = async (data: FormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const startDateTime = `${data.start_date}T${data.start_time}:00`;
  const endDateTime = `${data.end_date}T${data.end_time}:00`;

  const eventData = {
    title: data.title,
    description: data.description,
    start_time: startDateTime,
    end_time: endDateTime,
    user_id: user.id,
    created_by: user.id,
    client_id: data.client_id || null,
    attorney_id: data.attorney_id || null,
    case_id: data.case_id || null,
  };

  console.log('Creating calendar event:', eventData);

  const { data: event, error } = await supabase
    .from('calendar_events')
    .insert([eventData])
    .select()
    .single();

  if (error) {
    console.error('Error creating calendar event:', error);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  console.log('Calendar event created successfully:', event);
  return { success: true, event };
};
