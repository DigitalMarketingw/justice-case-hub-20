
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

  const signOut = async (setProfile?: (profile: any) => void) => {
    console.log('Starting EMERGENCY sign out process');
    
    try {
      // Immediately clear state - don't wait for anything
      if (setProfile) {
        setProfile(null);
      }
      
      // Force clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Supabase specific storage
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-huvmdbffioxhizgzeecd-auth-token');
      } catch (e) {
        console.log('Local storage already cleared');
      }
      
      // Attempt Supabase sign out but don't wait for it
      supabase.auth.signOut().catch(error => {
        console.error('Supabase sign out error (ignoring):', error);
      });
      
      // Force immediate navigation to auth page
      window.location.href = '/auth';
      
      return { error: null };
      
    } catch (error) {
      console.error('Sign out error (forcing logout anyway):', error);
      
      // Even if everything fails, force logout
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth';
      
      return { error: null };
    }
  };

  return {
    signIn,
    signUp,
    signOut,
  };
};
