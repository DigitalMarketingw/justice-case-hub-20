
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assignedAttorneyId: string;
}

export const fetchAttorneys = async (firmId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('role', 'attorney')
    .eq('firm_id', firmId)
    .order('first_name');

  if (error) {
    console.error('Error fetching attorneys:', error);
    return [];
  }

  return data || [];
};

export const createClient = async (
  formData: ClientFormData,
  firmId: string,
  userId: string,
  toast: ReturnType<typeof useToast>['toast']
) => {
  const temporaryPassword = generateTemporaryPassword();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: temporaryPassword,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: 'client',
        firm_id: firmId
      }
    }
  });

  if (authError) {
    toast({
      title: "Error",
      description: authError.message,
      variant: "destructive"
    });
    throw authError;
  }

  if (!authData.user) {
    const error = new Error("Failed to create user account");
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      phone: formData.phone || null,
      assigned_attorney_id: formData.assignedAttorneyId || null,
      created_by: userId,
      invited_at: new Date().toISOString(),
      password_reset_required: true
    })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError);
  }

  await supabase.rpc('log_user_activity', {
    p_user_id: authData.user.id,
    p_action: 'CLIENT_CREATED',
    p_details: {
      client_name: `${formData.firstName} ${formData.lastName}`,
      firm_id: firmId,
      assigned_attorney_id: formData.assignedAttorneyId || null,
      temporary_password: temporaryPassword
    }
  });

  toast({
    title: "Success",
    description: `Client created successfully. Temporary password: ${temporaryPassword}`,
    duration: 10000
  });

  return authData.user;
};
