
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationList } from "./ConversationList";
import { MessageThread } from "./MessageThread";
import { MessageOverview } from "./MessageOverview";
import { StartConversationDialog } from "./StartConversationDialog";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Users } from "lucide-react";

export const MessagingDashboard = () => {
  const { profile, user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleStartNewConversation = () => {
    setShowStartDialog(true);
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
      {/* Header with Start Conversation Button for Attorneys */}
      {profile?.role === 'attorney' && (
        <div className="p-4 border-b bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Your Conversations</h2>
              <p className="text-sm text-gray-600">Manage communications with your clients</p>
            </div>
            <Button 
              onClick={handleStartNewConversation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Conversation
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        <div className="w-1/3 border-r">
          <ConversationList 
            onSelectConversation={setSelectedConversation}
            selectedConversation={selectedConversation}
            onStartNewConversation={handleStartNewConversation}
          />
        </div>
        <div className="flex-1">
          {selectedConversation ? (
            <MessageThread 
              conversationId={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md p-8">
                <MessageSquare className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  {profile?.role === 'attorney' ? 'Start Messaging Your Clients' : 'Your Messages'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {profile?.role === 'attorney' 
                    ? 'Select an existing conversation or start a new one with your clients' 
                    : 'Select a conversation from the list to view messages and continue your discussions'
                  }
                </p>
                
                {profile?.role === 'attorney' && (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleStartNewConversation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Start New Conversation
                    </Button>
                    <div className="flex items-center justify-center text-sm text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Choose from your client list</span>
                    </div>
                  </div>
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
