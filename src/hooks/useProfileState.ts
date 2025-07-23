
import { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const useProfileState = (user: User | null, loading: boolean) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const fetchAttemptRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If auth is still loading or no user, clear profile and exit
    if (loading || !user) {
      if (!user && profile) {
        console.log('User logged out, clearing profile');
        setProfile(null);
      }
      setProfileLoading(false);
      return;
    }

    // If profile already exists for this user, don't refetch
    if (profile && profile.id === user.id) {
      console.log('Profile already exists for user, skipping fetch');
      setProfileLoading(false);
      return;
    }

    // Generate unique fetch attempt ID
    const attemptId = `${user.id}-${Date.now()}`;
    fetchAttemptRef.current = attemptId;

    console.log('Starting profile fetch for user:', user.id);
    setProfileLoading(true);

    const fetchProfile = async () => {
      try {
        // Check if this is still the current attempt
        if (fetchAttemptRef.current !== attemptId) {
          console.log('Fetch attempt cancelled (newer attempt started)');
          return;
        }

        console.log('Fetching profile from database');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // Check again if this is still the current attempt
        if (fetchAttemptRef.current !== attemptId) {
          console.log('Fetch attempt cancelled after database call');
          return;
        }

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }

        if (data) {
          console.log('Profile found:', data);
          const profileData = data as UserProfile;
          
          // Update last_login if not set
          if (!profileData.last_login) {
            const updatedProfile = {
              ...profileData,
              last_login: new Date().toISOString(),
            };
            setProfile(updatedProfile);
            
            // Update in database (don't await to avoid blocking)
            supabase
              .from('profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', user.id)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.error('Failed to update last_login:', updateError);
                }
              });
          } else {
            setProfile(profileData);
          }
        } else {
          console.log('No profile found, creating fallback');
          
          // Special handling for super admin email
          const userRole = user.email === 'superadmin@demo.com' ? 'super_admin' : 'attorney';
          
          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            first_name: null,
            last_name: null,
            role: userRole,
            firm_id: null,
            is_active: true,
            phone: null,
            last_login: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        
        // Check if this is still the current attempt before setting fallback
        if (fetchAttemptRef.current === attemptId) {
          // Special handling for super admin email
          const userRole = user.email === 'superadmin@demo.com' ? 'super_admin' : 'attorney';
          
          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            first_name: null,
            last_name: null,
            role: userRole,
            firm_id: null,
            is_active: true,
            phone: null,
            last_login: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
        }
      } finally {
        // Only update loading state if this is still the current attempt
        if (fetchAttemptRef.current === attemptId) {
          setProfileLoading(false);
        }
      }
    };

    // Set timeout for fallback profile creation
    timeoutRef.current = setTimeout(() => {
      if (fetchAttemptRef.current === attemptId && !profile) {
        console.log('Profile fetch timeout, creating fallback profile');
        
        // Special handling for super admin email
        const userRole = user.email === 'superadmin@demo.com' ? 'super_admin' : 'attorney';
        
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          first_name: null,
          last_name: null,
          role: userRole,
          firm_id: null,
          is_active: true,
          phone: null,
          last_login: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        setProfileLoading(false);
      }
    }, 3000);

    fetchProfile();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Don't clear fetchAttemptRef here as it's used to cancel requests
    };
  }, [user?.id, loading]); // Removed profile and profileLoading from dependencies

  return {
    profile,
    setProfile,
    profileLoading,
  };
};
