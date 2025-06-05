
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationList } from "./ConversationList";
import { MessageThread } from "./MessageThread";
import { MessageOverview } from "./MessageOverview";
import { StartConversationDialog } from "./StartConversationDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const MessagingDashboard = () => {
  const { profile, user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  // For super admin and firm admin, show overview of all conversations
  if (profile?.role === 'super_admin' || profile?.role === 'firm_admin' || user?.email === 'superadmin@demo.com') {
    if (selectedConversation) {
      return (
        <div className="h-[calc(100vh-200px)] flex">
          <div className="w-1/3 border-r">
            <ConversationList 
              onSelectConversation={setSelectedConversation}
              selectedConversation={selectedConversation}
            />
          </div>
          <div className="flex-1">
            <MessageThread 
              conversationId={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          </div>
        </div>
      );
    }
    
    return <MessageOverview onSelectConversation={setSelectedConversation} />;
  }

  // For attorneys and clients, show their direct conversations
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header with Start Conversation button for attorneys */}
      {profile?.role === 'attorney' && (
        <div className="p-4 border-b bg-white">
          <Button onClick={() => setShowStartDialog(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Start New Conversation
          </Button>
        </div>
      )}
      
      <div className="flex-1 flex">
        <div className="w-1/3 border-r">
          <ConversationList 
            onSelectConversation={setSelectedConversation}
            selectedConversation={selectedConversation}
          />
        </div>
        <div className="flex-1">
          {selectedConversation ? (
            <MessageThread 
              conversationId={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">Choose a conversation from the list to view messages</p>
                {profile?.role === 'attorney' && (
                  <p className="text-sm mt-2">Or click "Start New Conversation" to message a client</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <StartConversationDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
};
