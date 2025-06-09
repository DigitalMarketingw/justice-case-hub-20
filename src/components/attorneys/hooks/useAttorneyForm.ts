
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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

export function useAttorneyForm() {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState<AttorneyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    barNumber: "",
    specialization: "",
    yearsExperience: "",
    hourlyRate: "",
    firmId: profile?.firm_id || "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      barNumber: "",
      specialization: "",
      yearsExperience: "",
      hourlyRate: "",
      firmId: profile?.firm_id || "",
    });
  };

  const updateField = (field: keyof AttorneyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    setFormData,
    resetForm,
    updateField
  };
}
