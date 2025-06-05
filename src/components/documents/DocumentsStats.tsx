
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Users, HardDrive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentStats {
  totalDocuments: number;
  totalClients: number;
  totalSize: number;
  recentUploads: number;
}

export function DocumentsStats() {
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    totalClients: 0,
    totalSize: 0,
    recentUploads: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total documents count
        const { count: totalDocuments } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true });

        // Get unique clients with documents
        const { data: clientsData } = await supabase
          .from('documents')
          .select('client_id');
        
        const uniqueClients = new Set(clientsData?.map(d => d.client_id)).size;

        // Get total file size
        const { data: sizeData } = await supabase
          .from('documents')
          .select('file_size');
        
        const totalSize = sizeData?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

        // Get recent uploads (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: recentUploads } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .gte('upload_date', sevenDaysAgo.toISOString());

        setStats({
          totalDocuments: totalDocuments || 0,
          totalClients: uniqueClients,
          totalSize,
          recentUploads: recentUploads || 0
        });
      } catch (error) {
        console.error('Error fetching document stats:', error);
      }
    };

    fetchStats();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          <p className="text-xs text-muted-foreground">All uploaded documents</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients with Documents</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground">Unique clients</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          <p className="text-xs text-muted-foreground">Total file size</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
          <Upload className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentUploads}</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
