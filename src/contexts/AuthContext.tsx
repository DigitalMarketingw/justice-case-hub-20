
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
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  
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
          setProfileLoading(false);
          return;
        }

        // Update session and user
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch profile for authenticated users with enhanced error handling
        if (currentSession?.user) {
          setProfileLoading(true);
          
          // Set a timeout to prevent infinite loading
          profileFetchTimeout = setTimeout(() => {
            if (mounted) {
              console.log('Profile fetch timeout, proceeding without profile');
              setProfileLoading(false);
              setLoading(false);
            }
          }, 5000); // Increased timeout to 5 seconds

          try {
            console.log('Fetching profile for user:', currentSession.user.id);
            const fetchedProfile = await fetchUserProfile(currentSession.user.id);
            
            if (mounted) {
              // If profile fetch failed but user is authenticated, create a minimal profile
              if (!fetchedProfile && currentSession.user) {
                console.log('Creating fallback profile for authenticated user');
                const fallbackProfile = {
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  first_name: null,
                  last_name: null,
                  role: 'attorney' as const, // Default role for authenticated users
                  firm_id: null,
                  is_active: true,
                  phone: null,
                  last_login: null,
                };
                setProfile(fallbackProfile);
              }
            }
          } catch (error) {
            console.error('Failed to fetch profile:', error);
            
            // Create fallback profile even on error if user is authenticated
            if (mounted && currentSession.user) {
              console.log('Creating fallback profile due to fetch error');
              const fallbackProfile = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                first_name: null,
                last_name: null,
                role: 'attorney' as const,
                firm_id: null,
                is_active: true,
                phone: null,
                last_login: null,
              };
              setProfile(fallbackProfile);
            }
          } finally {
            if (mounted) {
              clearTimeout(profileFetchTimeout);
              setProfileLoading(false);
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
          setProfileLoading(true);
          
          // Set timeout for initial profile fetch
          profileFetchTimeout = setTimeout(() => {
            if (mounted) {
              console.log('Initial profile fetch timeout, proceeding without profile');
              setProfileLoading(false);
              setLoading(false);
            }
          }, 5000);
          
          try {
            console.log('Fetching profile for initial session:', currentSession.user.id);
            const fetchedProfile = await fetchUserProfile(currentSession.user.id);
            
            // Create fallback if needed
            if (!fetchedProfile && mounted) {
              const fallbackProfile = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                first_name: null,
                last_name: null,
                role: 'attorney' as const,
                firm_id: null,
                is_active: true,
                phone: null,
                last_login: null,
              };
              setProfile(fallbackProfile);
            }
          } catch (error) {
            console.error('Failed to fetch profile on initial load:', error);
            
            // Create fallback profile on error
            if (mounted && currentSession.user) {
              const fallbackProfile = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                first_name: null,
                last_name: null,
                role: 'attorney' as const,
                firm_id: null,
                is_active: true,
                phone: null,
                last_login: null,
              };
              setProfile(fallbackProfile);
            }
          } finally {
            if (mounted) {
              clearTimeout(profileFetchTimeout);
              setProfileLoading(false);
              setLoading(false);
            }
          }
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
    console.log('AuthContext: Starting enhanced sign out process for user:', user?.email);
    
    try {
      // Call the enhanced auth sign out
      await authSignOut(setProfile);
      
      console.log('AuthContext: Enhanced sign out completed successfully');
    } catch (error) {
      console.error('AuthContext: Error during sign out:', error);
      // Force clear state even if sign out fails
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Force navigation to auth page
      window.location.href = '/auth';
    }
  };

  // Determine if actually loading - don't wait for profile if user is authenticated
  const isActuallyLoading = loading && !user;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        signIn,
        signUp,
        signOut: handleSignOut,
        loading: isActuallyLoading,
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
