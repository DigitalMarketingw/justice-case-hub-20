
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('fetchUserProfile called for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        throw error;
      }
      
      if (!data) {
        console.log('No profile found for user');
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      const profileData = data as UserProfile;
      setProfile(profileData);
      return profileData;
      
    } catch (error: any) {
      console.error('Critical error in fetchUserProfile:', error.message);
      return null;
    }
  }, []); // Empty dependency array since it doesn't depend on any state

  return {
    profile,
    setProfile,
    fetchUserProfile,
  };
};
