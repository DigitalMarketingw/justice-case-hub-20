
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_profile: {
    first_name: string;
    last_name: string;
  };
}

interface MessageThreadProps {
  conversationId: string;
  onBack: () => void;
}

export const MessageThread = ({ conversationId, onBack }: MessageThreadProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages();
      fetchConversationInfo();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            console.log('Real-time message update:', payload);
            if (payload.eventType === 'INSERT') {
              fetchMessages(); // Refresh messages when new message is inserted
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversationInfo = async () => {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          client_id,
          attorney_id,
          client_profile:profiles!conversations_client_id_fkey (first_name, last_name),
          attorney_profile:profiles!conversations_attorney_id_fkey (first_name, last_name)
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error fetching conversation info:', error);
        return;
      }
      
      console.log('Conversation info:', conversation);
      setConversationInfo(conversation);
    } catch (error) {
      console.error('Error fetching conversation info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          is_read,
          sender_profile:profiles!messages_sender_id_fkey (first_name, last_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const transformedMessages = messages?.map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read,
        sender_profile: {
          first_name: msg.sender_profile?.first_name || 'Unknown',
          last_name: msg.sender_profile?.last_name || 'User'
        }
      })) || [];

      setMessages(transformedMessages);
      
      // Mark messages as read if they're for the current user
      const unreadMessages = messages?.filter(msg => 
        msg.recipient_id === user.id && !msg.is_read
      );
      
      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationInfo) return;

    setSending(true);
    try {
      // Determine recipient based on user role
      let recipientId;
      if (profile?.role === 'client') {
        recipientId = conversationInfo.attorney_id;
      } else {
        recipientId = conversationInfo.client_id;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          client_id: conversationInfo.client_id,
          conversation_id: conversationId,
          content: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      setNewMessage("");
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayName = profile?.role === 'client' 
    ? conversationInfo?.attorney_profile 
      ? `${conversationInfo.attorney_profile.first_name || ''} ${conversationInfo.attorney_profile.last_name || ''}`.trim()
      : 'Attorney'
    : conversationInfo?.client_profile
      ? `${conversationInfo.client_profile.first_name || ''} ${conversationInfo.client_profile.last_name || ''}`.trim()
      : 'Client';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{displayName}</h3>
          <p className="text-sm text-gray-500">
            {profile?.role === 'client' ? 'Attorney' : 'Client'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-xs lg:max-w-md ${
                message.sender_id === user.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border-gray-200'
              }`}>
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user.id 
                      ? 'text-blue-100' 
                      : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            disabled={sending}
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
            className="px-3 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
