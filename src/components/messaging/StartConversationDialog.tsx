
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface StartConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export const StartConversationDialog = ({ 
  open, 
  onOpenChange, 
  onConversationCreated 
}: StartConversationDialogProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open, profile]);

  const fetchClients = async () => {
    setFetchingClients(true);
    try {
      // Get clients from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'client')
        .order('first_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setFetchingClients(false);
    }
  };

  const handleStartConversation = async () => {
    if (!selectedClientId || !message.trim()) {
      toast({
        title: "Error",
        description: "Please select a client and enter a message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create conversation
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .insert({
          client_id: selectedClientId,
          attorney_id: user?.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Send the first message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: selectedClientId,
          conversation_id: conversationData.id,
          content: message.trim()
        });

      if (messageError) throw messageError;

      toast({
        title: "Success",
        description: "Conversation started successfully",
      });

      // Reset form and close dialog
      setSelectedClientId("");
      setMessage("");
      onOpenChange(false);
      onConversationCreated(selectedClientId);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            Select a client and send your first message to start a new conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Client</label>
            <Select 
              value={selectedClientId} 
              onValueChange={setSelectedClientId}
              disabled={fetchingClients}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  fetchingClients ? "Loading clients..." : "Choose a client"
                } />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartConversation} 
            disabled={loading || !selectedClientId || !message.trim()}
          >
            {loading ? "Starting..." : "Start Conversation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
