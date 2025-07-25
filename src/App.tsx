
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Clients from "./pages/Clients";
import Attorneys from "./pages/Attorneys";
import Calendar from "./pages/Calendar";
import Billing from "./pages/Billing";
import Documents from "./pages/Documents";
import Cases from "./pages/Cases";
import Firms from "./pages/Firms";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import CaseReferrals from "./pages/CaseReferrals";

// Role-specific dashboards
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import FirmAdminDashboard from "./pages/FirmAdminDashboard";
import CaseManagerDashboard from "./pages/CaseManagerDashboard";
import AttorneyDashboard from "./pages/AttorneyDashboard";
import ClientDashboard from "./pages/ClientDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/" element={<Index />} />
              
              {/* Role-Specific Dashboard Routes */}
              <Route path="/super-admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/firm-admin" element={
                <ProtectedRoute allowedRoles={['firm_admin']}>
                  <FirmAdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/case-manager" element={
                <ProtectedRoute allowedRoles={['case_manager']}>
                  <CaseManagerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/attorney" element={
                <ProtectedRoute allowedRoles={['attorney']}>
                  <AttorneyDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/client" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              
              {/* Protected Feature Routes */}
              <Route path="/clients" element={
                <ProtectedRoute allowedRoles={['super_admin', 'firm_admin', 'attorney', 'case_manager']}>
                  <Clients />
                </ProtectedRoute>
              } />
              
              <Route path="/attorneys" element={
                <ProtectedRoute allowedRoles={['super_admin', 'firm_admin']}>
                  <Attorneys />
                </ProtectedRoute>
              } />
              
              <Route path="/cases" element={
                <ProtectedRoute allowedRoles={['super_admin', 'firm_admin', 'attorney', 'case_manager']}>
                  <Cases />
                </ProtectedRoute>
              } />

              <Route path="/case-referrals" element={
                <ProtectedRoute allowedRoles={['super_admin', 'firm_admin']}>
                  <CaseReferrals />
                </ProtectedRoute>
              } />

              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />

              <Route path="/firms" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <Firms />
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
              
              <Route path="/billing" element={
                <ProtectedRoute allowedRoles={['super_admin', 'firm_admin', 'attorney']}>
                  <Billing />
                </ProtectedRoute>
              } />
              
              <Route path="/documents" element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
