
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Clock, Eye } from "lucide-react";

interface ConversationOverview {
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
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Fetch all messages with related data
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
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

      if (error) throw error;

      // Group by client_id to create conversation overview
      const conversationMap = new Map<string, ConversationOverview>();
      let totalUnread = 0;

      messages?.forEach((message: any) => {
        const clientId = message.client_id;
        
        if (!conversationMap.has(clientId)) {
          conversationMap.set(clientId, {
            client_id: clientId,
            client_name: message.clients?.full_name || 'Unknown Client',
            attorney_name: message.sender_profile?.first_name 
              ? `${message.sender_profile.first_name} ${message.sender_profile.last_name}`
              : `${message.recipient_profile?.first_name} ${message.recipient_profile?.last_name}`,
            message_count: 0,
            unread_count: 0,
            last_message_time: message.created_at,
            last_message_content: message.content
          });
        }

        const conv = conversationMap.get(clientId)!;
        conv.message_count++;
        
        if (!message.is_read) {
          conv.unread_count++;
          totalUnread++;
        }
      });

      const conversationList = Array.from(conversationMap.values());
      setConversations(conversationList);
      
      setStats({
        totalConversations: conversationList.length,
        totalMessages: messages?.length || 0,
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
                  key={conversation.client_id}
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
                        {new Date(conversation.last_message_time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectConversation(conversation.client_id)}
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
