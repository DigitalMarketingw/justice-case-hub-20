
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { AuthContextType } from "@/types/auth";
import { useProfile } from "@/hooks/useProfile";
import { useAuthOperations } from "@/hooks/useAuthOperations";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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
        
        // Handle sign out immediately
        if (event === 'SIGNED_OUT' || !currentSession) {
          console.log('User signed out, clearing state');
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Update session and user
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Only fetch profile on sign in, not on token refresh
        if (event === 'SIGNED_IN' && currentSession?.user) {
          try {
            console.log('Fetching profile for user:', currentSession.user.id);
            await fetchUserProfile(currentSession.user.id);
          } catch (error) {
            console.error('Failed to fetch profile:', error);
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        } else {
          // For token refresh or other events, just clear loading
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session only once
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('Initial session check:', currentSession?.user?.email);
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          try {
            console.log('Fetching profile for initial session:', currentSession.user.id);
            await fetchUserProfile(currentSession.user.id);
          } catch (error) {
            console.error('Failed to fetch profile on initial load:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const handleSignOut = async () => {
    console.log('Starting sign out process');
    try {
      // Clear state immediately to prevent stuck loading
      setProfile(null);
      setLoading(true);
      
      await authSignOut(setProfile);
      
      // The auth state change handler will handle the rest
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force clear state even if sign out fails
      setSession(null);
      setUser(null);
      setProfile(null);
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { UserRole } from "@/types/auth";
