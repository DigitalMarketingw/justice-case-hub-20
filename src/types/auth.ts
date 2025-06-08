
import { Session, User } from "@supabase/supabase-js";

export type UserRole = "super_admin" | "firm_admin" | "attorney" | "client";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  firm_id: string | null;
  is_active: boolean;
  phone: string | null;
  last_login: string | null;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}
