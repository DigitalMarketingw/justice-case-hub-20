import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Clock, Eye } from "lucide-react";

interface MessageOverviewProps {
  onSelectConversation: (conversationId: string) => void;
}

interface ConversationSummary {
  id: string;
  client_name: string;
  attorney_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  total_messages: number;
}

export const MessageOverview = ({ onSelectConversation }: MessageOverviewProps) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalUnread: 0,
    activeToday: 0
  });

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversation overview for admin:', user?.id);
      
      // Get all conversations with participant details
      const { data: conversationsData, error } = await supabase
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

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      console.log('Raw conversations data:', conversationsData);

      // Process conversations and get additional data
      const conversationList: ConversationSummary[] = [];
      let totalUnread = 0;
      let activeToday = 0;
      const today = new Date().toDateString();
      
      for (const conv of conversationsData || []) {
        // Get latest message
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Count total messages in conversation
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        // Count unread messages in conversation
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false);

        totalUnread += unreadCount || 0;
        
        // Check if active today
        if (latestMessage?.created_at && new Date(latestMessage.created_at).toDateString() === today) {
          activeToday++;
        }

        const clientName = conv.client_profile 
          ? `${conv.client_profile.first_name || ''} ${conv.client_profile.last_name || ''}`.trim() || 'Unknown Client'
          : 'Unknown Client';

        const attorneyName = conv.attorney_profile 
          ? `${conv.attorney_profile.first_name || ''} ${conv.attorney_profile.last_name || ''}`.trim() || 'Unknown Attorney'
          : 'Unknown Attorney';

        conversationList.push({
          id: conv.id,
          client_name: clientName,
          attorney_name: attorneyName,
          last_message: latestMessage?.content || 'No messages yet',
          last_message_time: latestMessage?.created_at || conv.last_message_at || '',
          unread_count: unreadCount || 0,
          total_messages: messageCount || 0
        });
      }

      setConversations(conversationList);
      setStats({
        totalConversations: conversationList.length,
        totalUnread,
        activeToday
      });
    } catch (error) {
      console.error('Error fetching conversation overview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-conversations-overview')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversations updated, refreshing overview');
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('Messages updated, refreshing overview');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Message Overview</h2>
        <p className="text-gray-600 mt-2">Monitor all attorney-client communications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-3xl font-bold text-red-600">{stats.totalUnread}</p>
              </div>
              <Eye className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeToday}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Overview of all attorney-client conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {conversation.attorney_name} ↔ {conversation.client_name}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive">
                            {conversation.unread_count} unread
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.last_message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{conversation.total_messages} messages</span>
                        <span>
                          {conversation.last_message_time ? 
                            new Date(conversation.last_message_time).toLocaleDateString() : 
                            'New conversation'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
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
