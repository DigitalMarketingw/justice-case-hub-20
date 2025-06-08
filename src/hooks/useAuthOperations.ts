
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

      // Update last login timestamp
      try {
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('email', email);
      } catch (updateError) {
        console.error('Error updating last login:', updateError);
        // Don't fail the sign-in for this
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
    console.log('Starting enhanced signOut process');
    try {
      // Clear profile state immediately for instant UI feedback
      setProfile(null);
      
      // Force clear local storage to ensure clean state
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-huvmdbffioxhizgzeecd-auth-token');
      
      // Sign out from Supabase with additional options
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      });
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Don't throw error - continue with forced logout
      }
      
      // Force refresh the page to ensure clean state
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      console.log('Enhanced sign out completed');
      
      toast({
        title: "Signed out successfully",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Force clear state even if error occurs
      setProfile(null);
      localStorage.clear();
      
      // Force navigation to auth page
      window.location.href = '/auth';
      
      toast({
        title: "Signed out successfully",
      });
      
      return { error: null };
    }
  };

  return {
    signIn,
    signUp,
    signOut,
  };
};
