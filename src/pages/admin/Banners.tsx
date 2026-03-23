import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const AdminBanners = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: banners } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('banners').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (b: any) => {
      const payload = { title: b.title, subtitle: b.subtitle || null, image_url: b.image_url, link: b.link || null, position: b.position, is_active: b.is_active, sort_order: parseInt(b.sort_order) || 0 };
      if (b.id) {
        const { error } = await supabase.from('banners').update(payload).eq('id', b.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); setDialogOpen(false); toast.success('Banner saved'); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('banners').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Deleted'); },
  });

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-between items-center mb-6">
        <p className="font-body text-sm text-muted-foreground">{banners?.length || 0} banners</p>
        <Button onClick={() => { setEditing({ title: '', subtitle: '', image_url: '', link: '', position: 'hero', is_active: true, sort_order: '0' }); setDialogOpen(true); }} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Banner</Button>
      </div>

      <div className="grid gap-4">
        {banners?.map((b) => (
          <div key={b.id} className="bg-background rounded-lg border border-border p-4 flex gap-4 items-center">
            <img src={b.image_url} alt={b.title} className="w-32 h-20 rounded object-cover" />
            <div className="flex-1">
              <h3 className="font-body font-medium text-sm">{b.title}</h3>
              <p className="text-xs text-muted-foreground">{b.subtitle}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">{b.position}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing({ ...b, sort_order: String(b.sort_order) }); setDialogOpen(true); }} className="p-2 hover:bg-accent rounded"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(b.id); }} className="p-2 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-xl">{editing?.id ? 'Edit' : 'New'} Banner</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div><Label className="font-body text-xs">Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></div>
              <div><Label className="font-body text-xs">Subtitle</Label><Input value={editing.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div><Label className="font-body text-xs">Image URL</Label><Input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} required /></div>
              <div><Label className="font-body text-xs">Link</Label><Input value={editing.link || ''} onChange={(e) => setEditing({ ...editing, link: e.target.value })} /></div>
              <div><Label className="font-body text-xs">Position</Label>
                <select value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background">
                  <option value="hero">Hero</option>
                  <option value="mid">Mid</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                <Label className="font-body text-xs">Active</Label>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBanners;
