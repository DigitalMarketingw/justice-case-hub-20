import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DroppedCase {
  id: string;
  title: string;
  case_number: string;
  client_name: string;
  attorney_name: string;
  dropped_date: string;
  dropped_by: string;
  dropper_name: string;
  drop_reason: string;
  status: string;
}

interface DroppedCasesSectionProps {
  onCaseReactivated: () => void;
}

export function DroppedCasesSection({ onCaseReactivated }: DroppedCasesSectionProps) {
  const [droppedCases, setDroppedCases] = useState<DroppedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactivateDialog, setReactivateDialog] = useState<{ open: boolean; caseId?: string; caseTitle?: string }>({ open: false });
  const [reactivating, setReactivating] = useState(false);
  const { profile } = useAuth();

  const fetchDroppedCases = async () => {
    if (!profile?.firm_id) return;

    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          case_number,
          status,
          dropped_date,
          dropped_by,
          drop_reason,
          client:profiles!cases_client_id_fkey(first_name, last_name),
          attorney:profiles!cases_attorney_id_fkey(first_name, last_name),
          dropper:profiles!cases_dropped_by_fkey(first_name, last_name)
        `)
        .eq('is_dropped', true)
        .eq('firm_id', profile.firm_id)
        .order('dropped_date', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(case_item => ({
        id: case_item.id,
        title: case_item.title,
        case_number: case_item.case_number,
        client_name: case_item.client ? `${case_item.client.first_name} ${case_item.client.last_name}` : 'Unknown',
        attorney_name: case_item.attorney ? `${case_item.attorney.first_name} ${case_item.attorney.last_name}` : 'Unassigned',
        dropped_date: case_item.dropped_date,
        dropped_by: case_item.dropped_by,
        dropper_name: case_item.dropper ? `${case_item.dropper.first_name} ${case_item.dropper.last_name}` : 'Unknown',
        drop_reason: case_item.drop_reason || 'No reason provided',
        status: case_item.status
      })) || [];

      setDroppedCases(transformedData);
    } catch (error) {
      console.error('Error fetching dropped cases:', error);
      toast.error('Failed to fetch dropped cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDroppedCases();
  }, [profile?.firm_id]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleReactivateCase = async () => {
    if (!reactivateDialog.caseId || !profile?.id) return;

    setReactivating(true);
    try {
      const { error } = await supabase
        .from('cases')
        .update({
          is_dropped: false,
          dropped_date: null,
          dropped_by: null,
          drop_reason: null
        })
        .eq('id', reactivateDialog.caseId);

      if (error) throw error;

      toast.success(`${reactivateDialog.caseTitle} has been reactivated successfully`);
      setReactivateDialog({ open: false });
      fetchDroppedCases();
      onCaseReactivated();
    } catch (error: any) {
      console.error('Error reactivating case:', error);
      toast.error('Failed to reactivate case');
    } finally {
      setReactivating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dropped Cases</CardTitle>
            <CardDescription>
              Cases that have been dropped from active management
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDroppedCases}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading dropped cases...</div>
          ) : droppedCases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No dropped cases found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Attorney</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dropped Date</TableHead>
                  <TableHead>Dropped By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {droppedCases.map((case_item) => (
                  <TableRow key={case_item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{case_item.title}</div>
                        <div className="text-sm text-muted-foreground">{case_item.case_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>{case_item.client_name}</TableCell>
                    <TableCell>{case_item.attorney_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{case_item.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(case_item.dropped_date)}</TableCell>
                    <TableCell>{case_item.dropper_name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={case_item.drop_reason}>
                      {case_item.drop_reason}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReactivateDialog({ open: true, caseId: case_item.id, caseTitle: case_item.title })}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={reactivateDialog.open}
        onOpenChange={(open) => setReactivateDialog({ open })}
        title="Reactivate Case"
        description={`Are you sure you want to reactivate "${reactivateDialog.caseTitle}"? This will restore the case to active status.`}
        confirmText="Reactivate"
        onConfirm={handleReactivateCase}
        loading={reactivating}
      />
    </>
  );
}