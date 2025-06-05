
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';

export function SecuritySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "Your password has been changed.",
      });

      // Clear form
      setPasswords({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="flex items-center space-x-3 mb-6">
        <Lock size={24} className="text-gray-600" />
        <div>
          <h3 className="text-lg font-medium">Change Password</h3>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current_password">Current Password</Label>
          <Input
            id="current_password"
            type="password"
            value={passwords.current}
            onChange={(e) => handleInputChange('current', e.target.value)}
            placeholder="Enter current password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_password">New Password</Label>
          <Input
            id="new_password"
            type="password"
            value={passwords.new}
            onChange={(e) => handleInputChange('new', e.target.value)}
            placeholder="Enter new password"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm New Password</Label>
          <Input
            id="confirm_password"
            type="password"
            value={passwords.confirm}
            onChange={(e) => handleInputChange('confirm', e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Updating...' : 'Update Password'}
      </Button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Password Requirements</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• At least 6 characters long</li>
          <li>• Use a strong, unique password</li>
          <li>• Don't reuse passwords from other accounts</li>
        </ul>
      </div>
    </form>
  );
}
