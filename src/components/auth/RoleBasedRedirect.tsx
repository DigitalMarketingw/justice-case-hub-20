import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function RoleBasedRedirect() {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading || !profile) return;

    // Redirect to appropriate dashboard based on role
    switch (profile.role) {
      case 'super_admin':
        navigate('/super-admin', { replace: true });
        break;
      case 'firm_admin':
        navigate('/firm-admin', { replace: true });
        break;
      case 'case_manager':
        navigate('/case-manager', { replace: true });
        break;
      case 'attorney':
        navigate('/attorney', { replace: true });
        break;
      case 'client':
        navigate('/client', { replace: true });
        break;
      default:
        navigate('/attorney', { replace: true });
    }
  }, [profile, loading, navigate]);

  return null;
}