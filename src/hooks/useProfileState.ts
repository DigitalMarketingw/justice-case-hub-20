
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { useProfile } from "@/hooks/useProfile";

export const useProfileState = (user: User | null, loading: boolean) => {
  const { profile, setProfile, fetchUserProfile } = useProfile();
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let profileFetchTimeout: NodeJS.Timeout;

    if (loading || !user) {
      if (!user) {
        setProfile(null);
      }
      return;
    }

    // Prevent multiple simultaneous fetches
    if (profileLoading) return;

    setProfileLoading(true);

    // Set a timeout to create fallback profile if fetch takes too long
    profileFetchTimeout = setTimeout(() => {
      if (mounted && !profile) {
        console.log('Profile fetch timeout, creating fallback profile');
        const fallbackProfile: UserProfile = {
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
        setProfileLoading(false);
      }
    }, 3000);

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
            clearTimeout(profileFetchTimeout);
          } else {
            // No profile found, create fallback
            console.log('No profile found, creating fallback');
            const fallbackProfile: UserProfile = {
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
          const fallbackProfile: UserProfile = {
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
          setProfileLoading(false);
          clearTimeout(profileFetchTimeout);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
      setProfileLoading(false);
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
    };
  }, [user, loading, fetchUserProfile, setProfile, profileLoading, profile]);

  return {
    profile,
    setProfile,
    profileLoading,
  };
};
