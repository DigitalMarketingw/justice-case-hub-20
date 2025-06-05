
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Award, MoreHorizontal } from "lucide-react";

interface Attorney {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  years_of_experience?: number;
  office_location?: string;
  bio?: string;
  created_at: string;
  user_id?: string;
}

interface AttorneysTableProps {
  attorneys: Attorney[];
  loading: boolean;
  onRefresh: () => void;
}

export function AttorneysTable({ attorneys, loading, onRefresh }: AttorneysTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading attorneys...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attorneys ({attorneys.length})</span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attorneys.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No attorneys found</p>
            <p className="text-sm text-gray-400">Add your first attorney to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attorney</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Office</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attorneys.map((attorney) => (
                <TableRow key={attorney.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{attorney.full_name}</div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(attorney.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="mr-2 h-3 w-3" />
                        {attorney.email}
                      </div>
                      {attorney.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-3 w-3" />
                          {attorney.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {attorney.specialization ? (
                      <Badge variant="secondary">{attorney.specialization}</Badge>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {attorney.years_of_experience ? (
                      <div className="flex items-center">
                        <Award className="mr-2 h-4 w-4 text-gray-400" />
                        {attorney.years_of_experience} years
                      </div>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {attorney.office_location ? (
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                        {attorney.office_location}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
