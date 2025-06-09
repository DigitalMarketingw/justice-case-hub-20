
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

interface AttorneyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  barNumber: string;
  specialization: string;
  yearsExperience: string;
  hourlyRate: string;
  firmId: string;
}

export const createAttorney = async (
  formData: AttorneyFormData,
  targetFirmId: string,
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
        role: 'attorney',
        firm_id: targetFirmId
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
      created_by: userId,
      invited_at: new Date().toISOString(),
      password_reset_required: true
    })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError);
  }

  const { error: attorneyError } = await supabase
    .from('attorneys')
    .update({
      bar_number: formData.barNumber || null,
      specialization: formData.specialization ? [formData.specialization] : null,
      years_of_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
      hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
    })
    .eq('id', authData.user.id);

  if (attorneyError) {
    console.error('Error updating attorney info:', attorneyError);
  }

  await supabase.rpc('log_user_activity', {
    p_user_id: authData.user.id,
    p_action: 'ATTORNEY_CREATED',
    p_details: {
      attorney_name: `${formData.firstName} ${formData.lastName}`,
      firm_id: targetFirmId,
      bar_number: formData.barNumber || null,
      temporary_password: temporaryPassword
    }
  });

  toast({
    title: "Success",
    description: `Attorney created successfully. Temporary password: ${temporaryPassword}`,
    duration: 10000
  });

  return authData.user;
};
