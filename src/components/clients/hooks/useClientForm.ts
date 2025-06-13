
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assignedAttorneyId: string;
  password: string;
}

export function useClientForm() {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    assignedAttorneyId: "",
    password: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      assignedAttorneyId: "",
      password: "",
    });
  };

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const hasRequiredFields = formData.firstName && formData.lastName && formData.email;
    const isPasswordValid = !formData.password || formData.password.length >= 8;
    return hasRequiredFields && isPasswordValid;
  };

  return {
    formData,
    setFormData,
    resetForm,
    updateField,
    isFormValid,
    firmId: profile?.firm_id
  };
}
