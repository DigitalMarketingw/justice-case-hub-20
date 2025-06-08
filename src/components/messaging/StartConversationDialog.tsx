
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, User, Mail } from "lucide-react";

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
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
      setSelectedClientId("");
      setSelectedClient(null);
      setMessage("");
      setSearchTerm("");
    }
  }, [open, profile]);

  useEffect(() => {
    // Filter clients based on search term
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

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
      setFilteredClients(data || []);
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

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
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
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', selectedClientId)
        .eq('attorney_id', user?.id)
        .single();

      let conversationId;
      
      if (existingConversation) {
        conversationId = existingConversation.id;
        toast({
          title: "Info",
          description: "Continuing existing conversation with this client",
        });
      } else {
        // Create new conversation
        const { data: conversationData, error: convError } = await supabase
          .from('conversations')
          .insert({
            client_id: selectedClientId,
            attorney_id: user?.id
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = conversationData.id;
      }

      // Send the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: selectedClientId,
          conversation_id: conversationId,
          content: message.trim()
        });

      if (messageError) throw messageError;

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      toast({
        title: "Success",
        description: `Message sent to ${selectedClient?.first_name} ${selectedClient?.last_name}`,
      });

      // Reset form and close dialog
      setSelectedClientId("");
      setSelectedClient(null);
      setMessage("");
      setSearchTerm("");
      onOpenChange(false);
      onConversationCreated(conversationId);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setSelectedClientId("");
    setSelectedClient(null);
    setMessage("");
    setSearchTerm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
          <DialogDescription>
            Select a client from your list and send your first message to begin the conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4" onClick={(e) => e.stopPropagation()}>
          {/* Client Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Client</Label>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={fetchingClients}
              />
            </div>

            {/* Client Dropdown */}
            <Select 
              value={selectedClientId} 
              onValueChange={handleClientSelect}
              disabled={fetchingClients}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  fetchingClients ? "Loading clients..." : 
                  filteredClients.length === 0 ? "No clients found" :
                  "Choose a client"
                } />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {filteredClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {client.first_name} {client.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selected Client Info */}
            {selectedClient && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">
                      {selectedClient.first_name} {selectedClient.last_name}
                    </div>
                    <div className="text-sm text-blue-600">{selectedClient.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Message</Label>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={!selectedClientId}
            />
            <div className="text-xs text-gray-500 text-right">
              {message.length}/1000 characters
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartConversation} 
            disabled={loading || !selectedClientId || !message.trim() || message.length > 1000}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
