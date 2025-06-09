
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function useCaseForm() {
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      case_number: "",
      client_id: "",
      case_type: "",
      status: "pending",
      description: "",
      priority: "medium",
      court_name: "",
      judge_name: "",
      court_date: "",
      filing_date: "",
      estimated_hours: 0,
      billable_rate: 0,
    },
  });

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'client')
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  return {
    form,
    clients,
    fetchClients,
    resetForm,
  };
}
