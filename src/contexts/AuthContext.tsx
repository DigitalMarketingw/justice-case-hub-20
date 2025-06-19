
import React, { createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { AuthContextType } from "@/types/auth";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { useAuthState } from "@/hooks/useAuthState";
import { useProfileState } from "@/hooks/useProfileState";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, user, loading, setSession, setUser } = useAuthState();
  const { profile, setProfile, profileLoading } = useProfileState(user, loading);
  const { signIn, signUp, signOut: authSignOut } = useAuthOperations();

  const handleSignOut = async () => {
    console.log('AuthContext: Starting EMERGENCY sign out process');
    
    try {
      // Call the emergency auth sign out
      await authSignOut(setProfile);
      
    } catch (error) {
      console.error('AuthContext: Error during sign out (forcing logout):', error);
      // Force clear state and navigation even if sign out fails
      setSession(null);
      setUser(null);
      setProfile(null);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        signIn,
        signUp,
        signOut: handleSignOut,
        loading: loading || profileLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { UserRole } from "@/types/auth";
