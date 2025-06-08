
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { useProfile } from "@/hooks/useProfile";

export const useProfileState = (user: User | null, loading: boolean) => {
  const { profile, setProfile, fetchUserProfile } = useProfile();

  useEffect(() => {
    let mounted = true;
    let profileFetchTimeout: NodeJS.Timeout;

    if (loading || !user) return;

    // Fetch profile for authenticated users with simplified error handling
    profileFetchTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Profile fetch timeout, creating fallback profile');
        // Create immediate fallback profile
        const fallbackProfile = {
          id: user.id,
          email: user.email || '',
          first_name: null,
          last_name: null,
          role: 'attorney' as const,
          firm_id: null,
          is_active: true,
          phone: null,
          last_login: new Date().toISOString(), // Set current time to prevent onboarding loop
        };
        setProfile(fallbackProfile);
      }
    }, 2000);

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.id);
        const fetchedProfile = await fetchUserProfile(user.id);
        
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
                  .eq('id', user.id);
              } catch (updateError) {
                console.error('Failed to update last_login:', updateError);
              }
            } else {
              setProfile(fetchedProfile);
            }
          } else {
            // Create fallback profile
            const fallbackProfile = {
              id: user.id,
              email: user.email || '',
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
            id: user.id,
            email: user.email || '',
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
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
    };
  }, [user, loading, fetchUserProfile, setProfile]);

  return {
    profile,
    setProfile,
  };
};
