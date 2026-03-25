import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSiteSettings } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  const [announcementText, setAnnouncementText] = useState('');

  const saveMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.put('/admin/site-settings', { announcement_text: text.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings updated');
    },
    onError: (e: any) => toast.error(e?.message || 'Unable to save settings'),
  });

  const value = announcementText || (settings as any)?.announcement_text || '';
  const isSettingsTableMissing = false;

  return (
    <AdminLayout title="Site Settings">
      <div className="bg-background rounded-lg border border-border p-6 max-w-3xl">
        <h2 className="font-display text-xl font-semibold mb-4">Top Announcement Bar</h2>
        <div className="space-y-2">
          <Label className="font-body text-xs">Announcement text</Label>
          <textarea
            value={value}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
            placeholder="FREE SHIPPING ON ORDERS OVER ₹4,999 · USE CODE CHIC15"
          />
        </div>
        <div className="mt-4">
          <Button onClick={() => saveMutation.mutate(value)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
