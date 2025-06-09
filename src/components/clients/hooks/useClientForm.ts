
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assignedAttorneyId: string;
}

export function useClientForm() {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    assignedAttorneyId: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      assignedAttorneyId: "",
    });
  };

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email;
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
