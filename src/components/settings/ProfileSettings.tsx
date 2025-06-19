
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { User, Upload } from 'lucide-react';

export function ProfileSettings() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
      });
    }
  }, [profile?.id, profile?.first_name, profile?.last_name, profile?.phone, profile?.email]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const updateData: any = {
        phone: formData.phone,
      };

      // Only allow name changes for non-client users
      if (profile?.role !== 'client') {
        updateData.first_name = formData.first_name;
        updateData.last_name = formData.last_name;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.role, formData, toast]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="" alt="Profile" />
          <AvatarFallback className="text-lg">
            <User size={32} />
          </AvatarFallback>
        </Avatar>
        <div>
          <Button type="button" variant="outline" className="flex items-center space-x-2">
            <Upload size={16} />
            <span>Upload Photo</span>
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            JPG, GIF or PNG. 1MB max.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            disabled={profile?.role === 'client'}
            placeholder="Enter first name"
          />
          {profile?.role === 'client' && (
            <p className="text-xs text-gray-500">Name cannot be changed for clients</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            disabled={profile?.role === 'client'}
            placeholder="Enter last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Input
          value={profile?.role?.replace('_', ' ').toUpperCase() || ''}
          disabled
          className="bg-gray-50 capitalize"
        />
        <p className="text-xs text-gray-500">Role cannot be changed</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
