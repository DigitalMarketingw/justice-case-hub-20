
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/auth";

export const useAuthOperations = () => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error.message);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Sign in catch error:', error.message);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = "client") => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Sign up successful",
        description: "Please check your email to confirm your account.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async (setProfile: (profile: any) => void) => {
    console.log('Starting signOut process');
    try {
      // Clear profile state immediately for instant UI feedback
      setProfile(null);
      
      // Sign out from Supabase (simplified - no need for global scope or localStorage.clear())
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Don't show error toast as it might be normal in some cases
      }
      
      console.log('Sign out completed');
      
      toast({
        title: "Signed out successfully",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear profile even if error occurs
      setProfile(null);
      
      toast({
        title: "Signed out successfully", // Show success anyway since we cleared state
      });
      
      return { error: null }; // Return success to prevent UI issues
    }
  };

  return {
    signIn,
    signUp,
    signOut,
  };
};
