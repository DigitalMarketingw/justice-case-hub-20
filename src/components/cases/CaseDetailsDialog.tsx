import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Building, Calendar, Clock, DollarSign, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CaseReferralHistory } from "./CaseReferralHistory";

interface CaseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
}

interface CaseDetails {
  id: string;
  title: string;
  case_number: string;
  status: string;
  case_type: string;
  priority: string;
  description?: string;
  court_name?: string;
  judge_name?: string;
  court_date?: string;
  filing_date?: string;
  estimated_hours?: number;
  billable_rate?: number;
  total_billed?: number;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  } | null;
  attorney: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  documents_count?: number;
  billing_entries_count?: number;
  total_hours_logged?: number;
}

export function CaseDetailsDialog({ open, onOpenChange, caseId }: CaseDetailsDialogProps) {
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (open && caseId) {
      fetchCaseDetails();
    }
  }, [open, caseId]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch case with related client and attorney data
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select(`
          *,
          client:profiles!cases_client_id_fkey(id, first_name, last_name, email, phone),
          attorney:profiles!cases_attorney_id_fkey(id, first_name, last_name, email)
        `)
        .eq('id', caseId)
        .maybeSingle();

      if (caseError) throw caseError;
      if (!caseData) throw new Error('Case not found');

      // Initialize case details with basic data
      let detailsData = {
        ...caseData,
        documents_count: 0,
        billing_entries_count: 0,
        total_hours_logged: 0,
      };

      // Role-aware additional data fetching
      const userRole = profile?.role;
      const isClientRole = userRole === 'client';
      const isAttorneyRole = userRole === 'attorney';
      const isAdminRole = ['super_admin', 'firm_admin', 'case_manager'].includes(userRole || '');

      // Fetch documents count - handle role-based access
      try {
        const { count: documentsCount } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('case_id', caseId);
        
        detailsData.documents_count = documentsCount || 0;
      } catch (docError) {
        console.warn('Unable to fetch documents count due to access restrictions:', docError);
        // For clients or attorneys without access, this is expected
        detailsData.documents_count = 0;
      }

      // Fetch billing entries stats - handle role-based access
      try {
        const { data: billingData } = await supabase
          .from('billing_entries')
          .select('hours_worked')
          .eq('case_id', caseId);

        const totalHoursLogged = billingData?.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0) || 0;
        
        detailsData.billing_entries_count = billingData?.length || 0;
        detailsData.total_hours_logged = totalHoursLogged;
      } catch (billingError) {
        console.warn('Unable to fetch billing data due to access restrictions:', billingError);
        // For clients without billing access, this is expected
        detailsData.billing_entries_count = 0;
        detailsData.total_hours_logged = 0;
      }

      setCaseDetails(detailsData);
    } catch (error) {
      console.error('Error fetching case details:', error);
      setCaseDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!caseDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Case details could not be loaded</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Case Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Case Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{caseDetails.title}</span>
                <div className="flex gap-2">
                  <Badge className={getStatusBadge(caseDetails.status)}>
                    {caseDetails.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityBadge(caseDetails.priority)}>
                    {caseDetails.priority}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>Case #{caseDetails.case_number}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Case Type</p>
                  <p className="capitalize">{caseDetails.case_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p>{format(new Date(caseDetails.created_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              {caseDetails.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                  <p className="text-gray-600">{caseDetails.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client & Attorney Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p>{caseDetails.client ? `${caseDetails.client.first_name} ${caseDetails.client.last_name}` : 'Client information not available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p>{caseDetails.client?.email || 'Not available'}</p>
                </div>
                {caseDetails.client?.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p>{caseDetails.client.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Assigned Attorney
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p>{caseDetails.attorney ? `${caseDetails.attorney.first_name} ${caseDetails.attorney.last_name}` : 'Attorney information not available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p>{caseDetails.attorney?.email || 'Not available'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Court Information */}
          {(caseDetails.court_name || caseDetails.judge_name || caseDetails.court_date || caseDetails.filing_date) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Court Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {caseDetails.court_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Court Name</p>
                    <p>{caseDetails.court_name}</p>
                  </div>
                )}
                {caseDetails.judge_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Judge</p>
                    <p>{caseDetails.judge_name}</p>
                  </div>
                )}
                {caseDetails.filing_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Filing Date
                    </p>
                    <p>{format(new Date(caseDetails.filing_date), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                {caseDetails.court_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Court Date
                    </p>
                    <p>{format(new Date(caseDetails.court_date), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Financial & Time Information */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Show billing info to attorneys and admins, hide from clients based on role */}
            {(profile?.role !== 'client' || (caseDetails.billable_rate || caseDetails.total_billed !== undefined)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {caseDetails.billable_rate && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Billable Rate</p>
                      <p>${caseDetails.billable_rate}/hour</p>
                    </div>
                  )}
                  {caseDetails.total_billed !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Billed</p>
                      <p className="text-lg font-semibold text-green-600">${caseDetails.total_billed}</p>
                    </div>
                  )}
                  {profile?.role === 'client' && !caseDetails.billable_rate && caseDetails.total_billed === undefined && (
                    <div className="text-sm text-gray-500">
                      Billing information not available
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {caseDetails.estimated_hours && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estimated Hours</p>
                    <p>{caseDetails.estimated_hours}h</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Hours Logged</p>
                  <p className="text-lg font-semibold text-blue-600">{caseDetails.total_hours_logged || 0}h</p>
                </div>
                {profile?.role === 'client' && caseDetails.total_hours_logged === 0 && (
                  <p className="text-xs text-gray-500">Time tracking data may be limited for your role</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Documents</p>
                  <p className="text-lg font-semibold text-purple-600">{caseDetails.documents_count || 0}</p>
                </div>
                {caseDetails.documents_count === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {profile?.role === 'client' ? 'No documents available to you' : 'No documents found'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Referral History */}
          <CaseReferralHistory caseId={caseDetails.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}