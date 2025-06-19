
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageIcon, FileIcon, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MessageAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
}

interface MessageWithAttachmentsProps {
  messageId: string;
  content: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

export function MessageWithAttachments({ 
  messageId, 
  content, 
  senderName, 
  timestamp, 
  isOwn 
}: MessageWithAttachmentsProps) {
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttachments();
  }, [messageId]);

  const fetchAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('message_attachments')
        .select('*')
        .eq('message_id', messageId);

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);
    return publicUrl;
  };

  const downloadFile = async (attachment: MessageAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        <div className="space-y-2">
          {/* Message content */}
          {content && (
            <p className="text-sm">{content}</p>
          )}

          {/* Attachments */}
          {!loading && attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="border rounded-lg p-2 bg-background/10">
                  {attachment.file_type === 'image' ? (
                    <div className="space-y-2">
                      <img
                        src={getFileUrl(attachment.file_path)}
                        alt={attachment.file_name}
                        className="max-w-full h-32 object-cover rounded cursor-pointer"
                        onClick={() => setSelectedImage(getFileUrl(attachment.file_path))}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate">{attachment.file_name}</span>
                        <span>{formatFileSize(attachment.file_size)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FileIcon className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{attachment.file_name}</p>
                        <p className="text-xs opacity-70">{formatFileSize(attachment.file_size)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(attachment)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message metadata */}
          <div className="flex justify-between items-center text-xs opacity-70">
            <span>{senderName}</span>
            <span>{format(new Date(timestamp), 'HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
