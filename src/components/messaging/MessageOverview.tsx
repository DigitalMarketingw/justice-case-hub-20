
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Clock, Eye } from "lucide-react";

interface ConversationOverview {
  conversation_id: string;
  client_id: string;
  client_name: string;
  attorney_name: string;
  message_count: number;
  unread_count: number;
  last_message_time: string;
  last_message_content: string;
}

interface MessageOverviewProps {
  onSelectConversation: (conversationId: string) => void;
}

export const MessageOverview = ({ onSelectConversation }: MessageOverviewProps) => {
  const [conversations, setConversations] = useState<ConversationOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    fetchOverviewData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-overview')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('Messages updated, refreshing overview');
          fetchOverviewData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversations updated, refreshing overview');
          fetchOverviewData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Get all conversations with participant info
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          client_id,
          attorney_id,
          last_message_at,
          client_profile:profiles!conversations_client_id_fkey (first_name, last_name),
          attorney_profile:profiles!conversations_attorney_id_fkey (first_name, last_name)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convError) {
        console.error('Error fetching conversations:', convError);
        return;
      }

      // Get all messages for stats
      const { data: allMessages, error: msgError } = await supabase
        .from('messages')
        .select('id, conversation_id, content, created_at, is_read');

      if (msgError) {
        console.error('Error fetching messages:', msgError);
        return;
      }

      const conversationList: ConversationOverview[] = [];
      let totalUnread = 0;

      for (const conv of conversationsData || []) {
        // Get messages for this conversation
        const convMessages = allMessages?.filter(msg => msg.conversation_id === conv.id) || [];
        const unreadCount = convMessages.filter(msg => !msg.is_read).length;
        const latestMessage = convMessages
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        totalUnread += unreadCount;

        const clientName = conv.client_profile 
          ? `${conv.client_profile.first_name || ''} ${conv.client_profile.last_name || ''}`.trim() || 'Unknown Client'
          : 'Unknown Client';

        const attorneyName = conv.attorney_profile 
          ? `${conv.attorney_profile.first_name || ''} ${conv.attorney_profile.last_name || ''}`.trim() || 'Unknown Attorney'
          : 'Unknown Attorney';

        conversationList.push({
          conversation_id: conv.id,
          client_id: conv.client_id,
          client_name: clientName,
          attorney_name: attorneyName,
          message_count: convMessages.length,
          unread_count: unreadCount,
          last_message_time: latestMessage?.created_at || conv.last_message_at || '',
          last_message_content: latestMessage?.content || 'No messages yet'
        });
      }

      setConversations(conversationList);
      setStats({
        totalConversations: conversationList.length,
        totalMessages: allMessages?.length || 0,
        unreadMessages: totalUnread
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">{stats.unreadMessages}</p>
              </div>
              <Badge variant="destructive" className="h-8 w-8 rounded-full flex items-center justify-center">
                {stats.unreadMessages}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.conversation_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{conversation.client_name}</h3>
                      <span className="text-sm text-gray-500">↔</span>
                      <span className="text-sm text-gray-600">{conversation.attorney_name}</span>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive">{conversation.unread_count} unread</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {conversation.last_message_content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {conversation.message_count} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {conversation.last_message_time ? 
                          new Date(conversation.last_message_time).toLocaleDateString() : 
                          'No activity'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectConversation(conversation.conversation_id)}
                    className="ml-4"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
