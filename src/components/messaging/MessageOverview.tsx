
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Users, Clock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MessageStats {
  totalConversations: number;
  unreadMessages: number;
  activeClients: number;
  todayMessages: number;
}

interface RecentConversation {
  id: string;
  client_name: string;
  attorney_name: string;
  last_message_at: string;
  unread_count: number;
  case_title?: string;
}

export function MessageOverview() {
  const [stats, setStats] = useState<MessageStats>({
    totalConversations: 0,
    unreadMessages: 0,
    activeClients: 0,
    todayMessages: 0,
  });
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.id) {
      fetchMessageStats();
      fetchRecentConversations();
    }
  }, [profile?.id]);

  const fetchMessageStats = async () => {
    if (!profile?.id) return;

    try {
      // Get total conversations for the user's firm
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, attorney_id, client_id')
        .or(`attorney_id.eq.${profile.id},client_id.eq.${profile.id}`);

      if (convError) throw convError;

      // Get unread messages
      const { data: unreadMessages, error: unreadError } = await supabase
        .from('messages')
        .select('id')
        .eq('recipient_id', profile.id)
        .eq('is_read', false);

      if (unreadError) throw unreadError;

      // Get today's messages
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayMessages, error: todayError } = await supabase
        .from('messages')
        .select('id')
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .gte('created_at', today.toISOString());

      if (todayError) throw todayError;

      // Get active clients count (for attorneys and firm admins)
      let activeClients = 0;
      if (profile.role === 'attorney') {
        const { data: clients, error: clientsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('assigned_attorney_id', profile.id)
          .eq('is_active', true);

        if (!clientsError) {
          activeClients = clients?.length || 0;
        }
      } else if (profile.role === 'firm_admin' && profile.firm_id) {
        const { data: clients, error: clientsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('firm_id', profile.firm_id)
          .eq('role', 'client')
          .eq('is_active', true);

        if (!clientsError) {
          activeClients = clients?.length || 0;
        }
      }

      setStats({
        totalConversations: conversations?.length || 0,
        unreadMessages: unreadMessages?.length || 0,
        activeClients,
        todayMessages: todayMessages?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching message stats:', error);
    }
  };

  const fetchRecentConversations = async () => {
    if (!profile?.id) return;

    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_at,
          attorney_id,
          client_id,
          cases (title)
        `)
        .or(`attorney_id.eq.${profile.id},client_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Get user names for each conversation
      const conversationsWithNames = await Promise.all(
        (conversations || []).map(async (conv) => {
          const [clientId, attorneyId] = [conv.client_id, conv.attorney_id];
          
          const { data: client } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', clientId)
            .single();

          const { data: attorney } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', attorneyId)
            .single();

          // Get unread count for this conversation
          const { data: unreadCount } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conv.id)
            .eq('recipient_id', profile.id)
            .eq('is_read', false);

          return {
            id: conv.id,
            client_name: client ? `${client.first_name} ${client.last_name}` : 'Unknown Client',
            attorney_name: attorney ? `${attorney.first_name} ${attorney.last_name}` : 'Unknown Attorney',
            last_message_at: conv.last_message_at,
            unread_count: unreadCount?.length || 0,
            case_title: conv.cases?.[0]?.title,
          };
        })
      );

      setRecentConversations(conversationsWithNames);

    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent conversations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentConversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {profile?.role === 'client' ? conversation.attorney_name : conversation.client_name}
                      </p>
                      {conversation.case_title && (
                        <p className="text-sm text-gray-600">Case: {conversation.case_title}</p>
                      )}
                      <p className="text-xs text-gray-500">{formatDate(conversation.last_message_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {conversation.unread_count > 0 && (
                      <Badge variant="destructive">{conversation.unread_count}</Badge>
                    )}
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
