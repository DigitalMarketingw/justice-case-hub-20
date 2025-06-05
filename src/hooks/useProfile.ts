
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        setProfile(null);
        return;
      }
      
      if (!data) {
        console.log('No profile found for user, this might be a new user');
        setProfile(null);
        return;
      }
      
      console.log('Profile fetched successfully:', data);
      setProfile(data as UserProfile);
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
      setProfile(null);
    }
  }, []); // Empty dependency array to prevent recreation

  return {
    profile,
    setProfile,
    fetchUserProfile,
  };
};
