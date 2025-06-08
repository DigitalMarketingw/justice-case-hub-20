
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Add retry logic for profile fetching
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (error) {
            console.error(`Error fetching user profile (attempt ${retryCount + 1}):`, error.message);
            
            // If it's the last retry, throw the error
            if (retryCount === maxRetries - 1) {
              throw error;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            retryCount++;
            continue;
          }
          
          if (!data) {
            console.log('No profile found for user, this might be a new user');
            setProfile(null);
            return null;
          }
          
          console.log('Profile fetched successfully:', data);
          setProfile(data as UserProfile);
          return data as UserProfile;
        } catch (retryError) {
          console.error(`Profile fetch attempt ${retryCount + 1} failed:`, retryError);
          retryCount++;
          
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000));
          }
        }
      }
      
      // If all retries failed, set profile to null and return null
      console.error('All profile fetch attempts failed');
      setProfile(null);
      return null;
      
    } catch (error: any) {
      console.error('Critical error in fetchUserProfile:', error.message);
      setProfile(null);
      return null;
    }
  }, []);

  return {
    profile,
    setProfile,
    fetchUserProfile,
  };
};
