
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    console.log('MessagingDashboard - Current user profile:', profile);
    console.log('MessagingDashboard - Current user:', user);
    console.log('MessagingDashboard - User role:', profile?.role);
    console.log('MessagingDashboard - User email:', user?.email);
  }, [profile, user]);

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleStartNewConversation = () => {
    console.log('Starting new conversation...');
    setShowStartDialog(true);
  };

  // Check if user should see admin overview
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'firm_admin' || user?.email === 'superadmin@demo.com';
  console.log('MessagingDashboard - Is admin?', isAdmin);

  // Check roles specifically
  const isAttorney = profile?.role === 'attorney';
  const isClient = profile?.role === 'client';

  // For admin users, show overview of all conversations
  if (isAdmin) {
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
      {/* Header with Start Conversation Button ONLY for Attorneys */}
      <div className="p-6 border-b bg-white shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAttorney ? 'Your Client Conversations' : 'Your Messages'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isAttorney 
                ? 'Manage communications with your clients' 
                : 'View your conversations with attorneys'
              }
            </p>
          </div>
          
          {/* ONLY show Start Conversation Button for Attorneys */}
          {isAttorney && (
            <Button 
              onClick={handleStartNewConversation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium shadow-lg flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Start New Conversation
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-1/3 border-r">
          <ConversationList 
            onSelectConversation={setSelectedConversation}
            selectedConversation={selectedConversation}
            onStartNewConversation={isAttorney ? handleStartNewConversation : undefined}
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
                  {isAttorney ? 'Start Messaging Your Clients' : 'Your Messages'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isAttorney
                    ? 'Select an existing conversation or start a new one with your clients' 
                    : 'Select a conversation from the list to view messages and continue your discussions with your attorney'
                  }
                </p>
                
                {/* Large Start Conversation Button in Empty State - ONLY for Attorneys */}
                {isAttorney && (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleStartNewConversation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg"
                      size="lg"
                    >
                      <Plus className="h-6 w-6 mr-2" />
                      Start New Conversation
                    </Button>
                    <div className="flex items-center justify-center text-sm text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Choose from your client list</span>
                    </div>
                  </div>
                )}

                {/* Client-specific empty state */}
                {isClient && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center text-sm text-gray-400">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>Your attorney will start conversations with you</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ONLY show StartConversationDialog for Attorneys */}
      {isAttorney && (
        <StartConversationDialog
          open={showStartDialog}
          onOpenChange={setShowStartDialog}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
};
