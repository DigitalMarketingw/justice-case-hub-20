
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  client_name: string;
  attorney_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  client_id: string;
  attorney_id: string;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversation: string | null;
}

export const ConversationList = ({ onSelectConversation, selectedConversation }: ConversationListProps) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, profile]);

  const fetchConversations = async () => {
    try {
      let query = supabase
        .from('messages')
        .select(`
          client_id,
          sender_id,
          recipient_id,
          content,
          created_at,
          is_read,
          clients:client_id (full_name),
          sender_profile:sender_id (first_name, last_name),
          recipient_profile:recipient_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (profile?.role === 'client') {
        query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      } else if (profile?.role === 'attorney') {
        query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      }
      // For admins, get all messages (no filter needed)

      const { data: messages, error } = await query;

      if (error) throw error;

      // Group messages by client_id to create conversations
      const conversationMap = new Map<string, Conversation>();
      
      messages?.forEach((message: any) => {
        const clientId = message.client_id;
        const isFromClient = message.sender_id !== user.id && message.clients;
        const isToClient = message.recipient_id !== user.id && message.clients;
        
        if (!conversationMap.has(clientId)) {
          conversationMap.set(clientId, {
            id: clientId,
            client_name: message.clients?.full_name || 'Unknown Client',
            attorney_name: isFromClient 
              ? message.recipient_profile?.first_name + ' ' + message.recipient_profile?.last_name
              : message.sender_profile?.first_name + ' ' + message.sender_profile?.last_name,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0,
            client_id: clientId,
            attorney_id: isFromClient ? message.recipient_id : message.sender_id
          });
        }
        
        // Count unread messages for current user
        if (!message.is_read && message.recipient_id === user.id) {
          const conv = conversationMap.get(clientId);
          if (conv) {
            conv.unread_count++;
          }
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversations
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">
                            {profile?.role === 'client' ? conversation.attorney_name : conversation.client_name}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conversation.last_message}
                        </p>
                        
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conversation.last_message_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
