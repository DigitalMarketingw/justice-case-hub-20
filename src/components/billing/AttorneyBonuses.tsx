
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AddBonusDialog } from "./AddBonusDialog";
import { BonusCriteriaDialog } from "./BonusCriteriaDialog";

interface AttorneyBonus {
  id: string;
  attorney_id: string;
  case_id: string | null;
  bonus_amount: number;
  bonus_type: string;
  description: string;
  awarded_date: string;
  attorney: {
    first_name: string;
    last_name: string;
  };
  case: {
    title: string;
    case_number: string;
  } | null;
}

export function AttorneyBonuses() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [bonuses, setBonuses] = useState<AttorneyBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

  const fetchBonuses = async () => {
    try {
      const { data, error } = await supabase
        .from('attorney_bonuses')
        .select(`
          *,
          attorney:profiles!attorney_bonuses_attorney_id_fkey(first_name, last_name),
          case:cases(title, case_number)
        `)
        .order('awarded_date', { ascending: false });

      if (error) throw error;
      setBonuses(data || []);
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      toast({
        title: "Error loading bonuses",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  const totalBonuses = bonuses.reduce((sum, bonus) => sum + Number(bonus.bonus_amount), 0);
  const monthlyBonuses = bonuses.filter(b => 
    new Date(b.awarded_date).getMonth() === new Date().getMonth()
  ).reduce((sum, bonus) => sum + Number(bonus.bonus_amount), 0);

  if (loading) {
    return <div className="animate-pulse">Loading bonuses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBonuses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyBonuses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(bonuses.map(b => b.attorney_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Attorney Bonuses</h3>
          <p className="text-sm text-muted-foreground">Manage performance bonuses and criteria</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCriteria(true)} variant="outline">
            Bonus Criteria
          </Button>
          <Button onClick={() => setShowAddBonus(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Bonus
          </Button>
        </div>
      </div>

      {/* Bonuses Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attorney</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonuses.map((bonus) => (
                <TableRow key={bonus.id}>
                  <TableCell>
                    {bonus.attorney.first_name} {bonus.attorney.last_name}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(bonus.bonus_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{bonus.bonus_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {bonus.case ? (
                      <div>
                        <div className="font-medium">{bonus.case.case_number}</div>
                        <div className="text-sm text-muted-foreground">{bonus.case.title}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">General</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(bonus.awarded_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{bonus.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddBonusDialog 
        open={showAddBonus} 
        onOpenChange={setShowAddBonus}
        onSuccess={fetchBonuses}
      />
      <BonusCriteriaDialog 
        open={showCriteria} 
        onOpenChange={setShowCriteria}
      />
    </div>
  );
}
