
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
  
  const { profile, setProfile, fetchUserProfile } = useProfile();
  const { signIn, signUp, signOut: authSignOut } = useAuthOperations();

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Handle profile fetching for signed in users
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' && currentSession?.user) {
          try {
            console.log('Fetching profile for user:', currentSession.user.id);
            await fetchUserProfile(currentSession.user.id);
          } catch (error) {
            console.error('Failed to fetch profile after auth change:', error);
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        } else {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        try {
          console.log('Fetching profile for initial session:', currentSession.user.id);
          await fetchUserProfile(currentSession.user.id);
        } catch (error) {
          console.error('Failed to fetch profile on initial load:', error);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      setProfile(null);
      await authSignOut(setProfile);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
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
