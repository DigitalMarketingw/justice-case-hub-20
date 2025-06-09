
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  title: string;
  case_number: string;
  client_id: string;
  case_type: string;
  status: string;
  description: string;
  priority: string;
  court_name: string;
  judge_name: string;
  court_date: string;
  filing_date: string;
  estimated_hours: number;
  billable_rate: number;
}

export const createCase = async (data: FormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cases')
    .insert({
      title: data.title,
      case_number: data.case_number,
      client_id: data.client_id,
      attorney_id: user.id,
      case_type: data.case_type,
      status: data.status as any,
      description: data.description,
      priority: data.priority as any,
      court_name: data.court_name || null,
      judge_name: data.judge_name || null,
      court_date: data.court_date || null,
      filing_date: data.filing_date || null,
      estimated_hours: data.estimated_hours || null,
      billable_rate: data.billable_rate || null,
    });

  if (error) throw error;
};
