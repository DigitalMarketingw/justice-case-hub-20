
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
      // Use the new conversations table with proper joins
      let query = supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          attorney_id,
          last_message_at,
          clients:client_id (id, full_name, profile_id),
          attorney_profile:attorney_id (first_name, last_name)
        `)
        .order('last_message_at', { ascending: false });

      // Filter based on user role
      if (profile?.role === 'client') {
        query = query.eq('client_id', user.id);
      } else if (profile?.role === 'attorney') {
        query = query.eq('attorney_id', user.id);
      }
      // For admins, get all conversations (no filter needed)

      const { data: conversationsData, error } = await query;

      if (error) throw error;

      // For each conversation, get the latest message and unread count
      const conversationList: Conversation[] = [];
      
      for (const conv of conversationsData || []) {
        // Get latest message
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Count unread messages for current user
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('recipient_id', user.id)
          .eq('is_read', false);

        conversationList.push({
          id: conv.id,
          client_name: conv.clients?.full_name || 'Unknown Client',
          attorney_name: conv.attorney_profile 
            ? `${conv.attorney_profile.first_name || ''} ${conv.attorney_profile.last_name || ''}`.trim()
            : 'Unknown Attorney',
          last_message: latestMessage?.content || 'No messages yet',
          last_message_time: latestMessage?.created_at || conv.last_message_at || '',
          unread_count: unreadCount || 0,
          client_id: conv.client_id,
          attorney_id: conv.attorney_id
        });
      }

      setConversations(conversationList);
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
            {profile?.role === 'attorney' && (
              <p className="text-sm mt-1">Start a new conversation with a client</p>
            )}
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
                          {conversation.last_message_time ? 
                            new Date(conversation.last_message_time).toLocaleDateString() : 
                            'New conversation'
                          }
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
