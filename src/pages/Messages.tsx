
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MessagingDashboard } from "@/components/messaging/MessagingDashboard";

const Messages = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            {profile?.role === 'client' ? 'Communicate with your attorney' :
             profile?.role === 'attorney' ? 'Manage client communications' :
             'View all attorney-client communications'}
          </p>
        </div>
        <MessagingDashboard />
      </main>
    </div>
  );
};

export default Messages;
