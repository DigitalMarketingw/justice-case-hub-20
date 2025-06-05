
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
    console.log('Signing out user');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      setProfile(null);
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out error",
        description: "There was an issue signing out",
        variant: "destructive",
      });
    }
  };

  return {
    signIn,
    signUp,
    signOut,
  };
};
