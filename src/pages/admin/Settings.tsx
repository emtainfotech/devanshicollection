import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSiteSettings } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Separator } from '@/components/ui/separator';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSiteSettings();
  
  const [formData, setFormData] = useState({
    announcement_text: '',
    free_shipping_threshold: '4999',
    flat_shipping_rate: '100',
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    youtube_url: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        announcement_text: (settings as any).announcement_text || '',
        free_shipping_threshold: String((settings as any).free_shipping_threshold || '4999'),
        flat_shipping_rate: String((settings as any).flat_shipping_rate || '100'),
        instagram_url: (settings as any).instagram_url || '',
        facebook_url: (settings as any).facebook_url || '',
        twitter_url: (settings as any).twitter_url || '',
        youtube_url: (settings as any).youtube_url || ''
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.put('/admin/site-settings', {
        ...data,
        announcement_text: data.announcement_text.trim(),
        free_shipping_threshold: Number(data.free_shipping_threshold),
        flat_shipping_rate: Number(data.flat_shipping_rate)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings updated');
    },
    onError: (e: any) => toast.error(e?.message || 'Unable to save settings'),
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout title="Site Settings">
      <div className="space-y-8 max-w-3xl">
        {/* Announcement */}
        <div className="bg-background rounded-lg border border-border p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Top Announcement Bar</h2>
          <div className="space-y-2">
            <Label className="font-body text-xs">Announcement text</Label>
            <textarea
              value={formData.announcement_text}
              onChange={(e) => handleChange('announcement_text', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
              placeholder="FREE SHIPPING ON ORDERS OVER ₹4,999 · USE CODE CHIC15"
            />
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-background rounded-lg border border-border p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Shipping Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-xs">Free Shipping Threshold (₹)</Label>
              <Input
                type="number"
                value={formData.free_shipping_threshold}
                onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                placeholder="4999"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs">Flat Shipping Rate (₹)</Label>
              <Input
                type="number"
                value={formData.flat_shipping_rate}
                onChange={(e) => handleChange('flat_shipping_rate', e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-background rounded-lg border border-border p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Social Media Links</h2>
          <p className="text-xs text-muted-foreground mb-6">Leave empty to hide the icon from the website footer.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-body text-xs">Instagram URL</Label>
              <Input
                value={formData.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/your-profile"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs">Facebook URL</Label>
              <Input
                value={formData.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/your-page"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs">Twitter URL</Label>
              <Input
                value={formData.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/your-handle"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs">Youtube URL</Label>
              <Input
                value={formData.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/c/your-channel"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => saveMutation.mutate(formData)} 
            disabled={saveMutation.isPending}
            size="lg"
            className="w-full md:w-auto px-8"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
