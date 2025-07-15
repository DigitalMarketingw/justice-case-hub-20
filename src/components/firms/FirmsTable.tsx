
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users, Mail, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewAdminsDialog } from "./ViewAdminsDialog";
import { EditFirmDialog } from "./EditFirmDialog";

interface FirmsTableProps {
  searchTerm: string;
}

export function FirmsTable({ searchTerm }: FirmsTableProps) {
  const [selectedFirm, setSelectedFirm] = useState<{id: string, name: string} | null>(null);
  const [showAdminsDialog, setShowAdminsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { data: firms, isLoading, refetch } = useQuery({
    queryKey: ['firms', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('firms')
        .select(`
          *,
          profiles!profiles_firm_id_fkey (
            id,
            first_name,
            last_name,
            email,
            role,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleViewAdmins = (firm: {id: string, name: string}) => {
    setSelectedFirm(firm);
    setShowAdminsDialog(true);
  };

  const handleEditFirm = (firm: {id: string, name: string}) => {
    setSelectedFirm(firm);
    setShowEditDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Firm Details</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Admins</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firms?.map((firm) => {
            const firmAdmins = firm.profiles?.filter(p => p.role === 'firm_admin') || [];
            const activeAdmins = firmAdmins.filter(a => a.is_active);
            
            return (
              <TableRow key={firm.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{firm.name}</div>
                    <div className="text-sm text-gray-500">ID: {firm.id.slice(0, 8)}...</div>
                    {firm.address && (
                      <div className="text-sm text-gray-500">{firm.address}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {firm.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {firm.email}
                      </div>
                    )}
                    {firm.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {firm.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {firmAdmins.length} admin{firmAdmins.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {firmAdmins.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {activeAdmins.length} active
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={firmAdmins.length > 0 ? "default" : "destructive"}>
                    {firmAdmins.length > 0 ? "Has Admin" : "No Admin"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewAdmins({id: firm.id, name: firm.name})}>
                        View Admins
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditFirm({id: firm.id, name: firm.name})}>
                        Edit Firm
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {firms?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No firms found</p>
        </div>
      )}
    
    {selectedFirm && (
      <>
        <ViewAdminsDialog
          open={showAdminsDialog}
          onOpenChange={setShowAdminsDialog}
          firmId={selectedFirm.id}
          firmName={selectedFirm.name}
        />
        <EditFirmDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          firmId={selectedFirm.id}
          onFirmUpdated={refetch}
        />
      </>
    )}
    </div>
  );
}
