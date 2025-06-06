import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Plus } from "lucide-react";

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
  onStartNewConversation?: () => void;
}

export const ConversationList = ({ 
  onSelectConversation, 
  selectedConversation,
  onStartNewConversation 
}: ConversationListProps) => {
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
      // First, get conversations based on user role
      let query = supabase
        .from('conversations')
        .select('id, client_id, attorney_id, last_message_at')
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

      // For each conversation, get the participant names and latest message
      const conversationList: Conversation[] = [];
      
      for (const conv of conversationsData || []) {
        // Get client profile information
        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', conv.client_id)
          .single();

        // Get attorney profile information
        const { data: attorneyProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', conv.attorney_id)
          .single();

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

        const clientName = clientProfile 
          ? `${clientProfile.first_name || ''} ${clientProfile.last_name || ''}`.trim()
          : 'Unknown Client';

        const attorneyName = attorneyProfile 
          ? `${attorneyProfile.first_name || ''} ${attorneyProfile.last_name || ''}`.trim()
          : 'Unknown Attorney';

        conversationList.push({
          id: conv.id,
          client_name: clientName,
          attorney_name: attorneyName,
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
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </h2>
        </div>
        
        {/* Attorney Start Conversation Button - Always Visible */}
        {profile?.role === 'attorney' && (
          <div className="mb-2">
            <Button 
              onClick={onStartNewConversation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Conversation
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
              {profile?.role === 'attorney' && (
                <div className="mt-4">
                  <p className="text-xs mb-3 text-gray-400">Start messaging your clients to begin</p>
                  <Button 
                    onClick={onStartNewConversation}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Message a Client
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
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
