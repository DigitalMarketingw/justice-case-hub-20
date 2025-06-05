
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { AuthContextType } from "@/types/auth";
import { useProfile } from "@/hooks/useProfile";
import { useAuthOperations } from "@/hooks/useAuthOperations";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileFetched, setProfileFetched] = useState<boolean>(false);
  
  const { profile, setProfile, fetchUserProfile } = useProfile();
  const { signIn, signUp, signOut: authSignOut } = useAuthOperations();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Reset profile fetched flag when auth state changes
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setProfileFetched(false);
        } else if (event === 'SIGNED_IN' && currentSession?.user && !profileFetched) {
          try {
            console.log('Fetching profile for user:', currentSession.user.id);
            await fetchUserProfile(currentSession.user.id);
            setProfileFetched(true);
          } catch (error) {
            console.error('Failed to fetch profile after auth change:', error);
            setProfileFetched(true); // Mark as fetched even if failed to prevent retry loops
          }
        }
        
        // Always set loading to false after processing auth state
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user && !profileFetched) {
        try {
          console.log('Fetching profile for initial session:', currentSession.user.id);
          await fetchUserProfile(currentSession.user.id);
          setProfileFetched(true);
        } catch (error) {
          console.error('Failed to fetch profile on initial load:', error);
          setProfileFetched(true); // Mark as fetched even if failed
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, profileFetched]);

  const handleSignOut = async () => {
    setProfileFetched(false);
    await authSignOut(setProfile);
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
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { UserRole } from "@/types/auth";
