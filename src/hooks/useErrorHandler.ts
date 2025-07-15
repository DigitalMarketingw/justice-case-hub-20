import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    let title = "An error occurred";
    let description = "Please try again or contact support if the problem persists.";

    if (context) {
      title = `Error in ${context}`;
    }

    // Handle specific error types
    if (error?.message) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        description = "This record already exists. Please check your data and try again.";
      } else if (error.message.includes('permission denied')) {
        description = "You don't have permission to perform this action.";
      } else if (error.message.includes('network')) {
        description = "Network error. Please check your connection and try again.";
      } else {
        description = error.message;
      }
    }

    toast({
      title,
      description,
      variant: "destructive",
    });
  }, [toast]);

  const handleSuccess = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
    });
  }, [toast]);

  return { handleError, handleSuccess };
}