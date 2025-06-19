
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ReferralCommentsProps {
  referralId: string;
  onCommentAdded?: () => void;
}

interface Comment {
  id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export function ReferralComments({ referralId, onCommentAdded }: ReferralCommentsProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_comments')
        .select(`
          *,
          user:profiles(first_name, last_name, role)
        `)
        .eq('referral_id', referralId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error loading comments",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [referralId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !profile) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('referral_comments')
        .insert({
          referral_id: referralId,
          user_id: profile.id,
          comment: newComment.trim(),
          is_internal: true,
        });

      if (error) throw error;

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });

      setNewComment('');
      fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <div className="animate-pulse">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Comments & Discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No comments yet. Start the discussion below.
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.user.first_name, comment.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.user.first_name} {comment.user.last_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {comment.user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy at h:mm a')}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment to this referral..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
