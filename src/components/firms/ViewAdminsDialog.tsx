import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, Calendar, UserX, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ViewAdminsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firmId: string;
  firmName: string;
}

export function ViewAdminsDialog({ open, onOpenChange, firmId, firmName }: ViewAdminsDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: admins, isLoading, refetch } = useQuery({
    queryKey: ['firm-admins', firmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('firm_id', firmId)
        .eq('role', 'firm_admin')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: open && !!firmId,
  });

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Administrator ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update administrator status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Administrators - {firmName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Administrators - {firmName}</DialogTitle>
        </DialogHeader>
        
        {admins && admins.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {admin.first_name} {admin.last_name}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {admin.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.phone ? (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {admin.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No phone</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdminStatus(admin.id, admin.is_active ?? true)}
                        disabled={loading}
                      >
                        {admin.is_active ? (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No administrators found for this firm</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}