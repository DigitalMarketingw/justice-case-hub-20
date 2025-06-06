
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Building, Upload } from 'lucide-react';

interface FirmData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  firm_code: string;
}

export function FirmSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [firmData, setFirmData] = useState<FirmData | null>(null);

  useEffect(() => {
    fetchFirmData();
  }, [profile?.firm_id]);

  const fetchFirmData = async () => {
    if (!profile?.firm_id) {
      setFetchLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .eq('id', profile.firm_id)
        .single();

      if (error) throw error;
      
      // Add firm_code if it doesn't exist in the data
      const firmDataWithCode = {
        ...data,
        firm_code: data.id.slice(0, 8).toUpperCase()
      };
      
      setFirmData(firmDataWithCode);
    } catch (error: any) {
      console.error('Error fetching firm data:', error);
      toast({
        title: "Error loading firm data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!firmData) return;
    setFirmData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmData || !profile?.firm_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('firms')
        .update({
          name: firmData.name,
          email: firmData.email,
          phone: firmData.phone,
          address: firmData.address,
        })
        .eq('id', profile.firm_id);

      if (error) throw error;

      toast({
        title: "Firm settings updated successfully",
        description: "Your firm information has been saved.",
      });
    } catch (error: any) {
      console.error('Error updating firm:', error);
      toast({
        title: "Error updating firm settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="animate-pulse space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  if (!firmData) {
    return <div className="text-center py-8">
      <p className="text-gray-500">No firm data found. Please contact your administrator.</p>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="" alt="Firm Logo" />
          <AvatarFallback className="text-lg">
            <Building size={32} />
          </AvatarFallback>
        </Avatar>
        <div>
          <Button type="button" variant="outline" className="flex items-center space-x-2">
            <Upload size={16} />
            <span>Upload Logo</span>
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            JPG, GIF or PNG. 2MB max.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firm_name">Firm Name</Label>
          <Input
            id="firm_name"
            value={firmData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter firm name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firm_code">Firm Code</Label>
          <Input
            id="firm_code"
            value={firmData.firm_code}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">Firm code cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firm_email">Email</Label>
          <Input
            id="firm_email"
            type="email"
            value={firmData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter firm email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firm_phone">Phone</Label>
          <Input
            id="firm_phone"
            value={firmData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter firm phone"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="firm_address">Address</Label>
        <Input
          id="firm_address"
          value={firmData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter firm address"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
