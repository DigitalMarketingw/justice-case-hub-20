
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
    let profileFetchTimeout: NodeJS.Timeout;
    
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

        // Fetch profile for authenticated users with simplified error handling
        if (currentSession?.user) {
          // Shorter timeout to prevent stuck loading states
          profileFetchTimeout = setTimeout(() => {
            if (mounted) {
              console.log('Profile fetch timeout, creating fallback profile');
              // Create immediate fallback profile
              const fallbackProfile = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                first_name: null,
                last_name: null,
                role: 'attorney' as const,
                firm_id: null,
                is_active: true,
                phone: null,
                last_login: new Date().toISOString(), // Set current time to prevent onboarding loop
              };
              setProfile(fallbackProfile);
              setLoading(false);
            }
          }, 2000);

          try {
            console.log('Fetching profile for user:', currentSession.user.id);
            const fetchedProfile = await fetchUserProfile(currentSession.user.id);
            
            if (mounted) {
              if (fetchedProfile) {
                // Ensure last_login is set to prevent onboarding loops
                if (!fetchedProfile.last_login) {
                  const updatedProfile = {
                    ...fetchedProfile,
                    last_login: new Date().toISOString(),
                  };
                  setProfile(updatedProfile);
                  
                  // Update in database
                  try {
                    await supabase
                      .from('profiles')
                      .update({ last_login: new Date().toISOString() })
                      .eq('id', currentSession.user.id);
                  } catch (updateError) {
                    console.error('Failed to update last_login:', updateError);
                  }
                } else {
                  setProfile(fetchedProfile);
                }
              } else {
                // Create fallback profile
                const fallbackProfile = {
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  first_name: null,
                  last_name: null,
                  role: 'attorney' as const,
                  firm_id: null,
                  is_active: true,
                  phone: null,
                  last_login: new Date().toISOString(),
                };
                setProfile(fallbackProfile);
              }
            }
          } catch (error) {
            console.error('Failed to fetch profile:', error);
            
            if (mounted) {
              // Create fallback profile on error
              const fallbackProfile = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                first_name: null,
                last_name: null,
                role: 'attorney' as const,
                firm_id: null,
                is_active: true,
                phone: null,
                last_login: new Date().toISOString(),
              };
              setProfile(fallbackProfile);
            }
          } finally {
            if (mounted) {
              clearTimeout(profileFetchTimeout);
              setLoading(false);
            }
          }
        } else {
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
          // The auth state change listener will handle profile fetching
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

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
