
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
}

export function useEventForm() {
  const [clients, setClients] = useState<Client[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      start_date: new Date().toISOString().split('T')[0],
      start_time: "09:00",
      end_date: new Date().toISOString().split('T')[0],
      end_time: "10:00",
      client_id: "",
      attorney_id: "",
      case_id: "",
    },
  });

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'client')
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchAttorneys = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'attorney')
        .order('first_name');

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error fetching attorneys:', error);
    }
  };

  const resetForm = () => {
    form.reset();
  };

  return {
    form,
    clients,
    attorneys,
    fetchClients,
    fetchAttorneys,
    resetForm,
  };
}
