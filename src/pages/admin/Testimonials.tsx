import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminTestimonials = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('testimonials').select('*').order('sort_order');
      if (error) {
        if ((error as any).code === '42P01') {
          toast.error("Missing table: public.testimonials. Run latest Supabase migration.");
          return [];
        }
        throw error;
      }
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const data = {
        customer_name: payload.customer_name,
        city: payload.city || null,
        rating: Number(payload.rating || 5),
        comment: payload.comment,
        sort_order: Number(payload.sort_order || 0),
        is_active: payload.is_active !== false,
      };
      if (payload.id) {
        const { error } = await supabase.from('testimonials').update(data).eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setDialogOpen(false);
      setEditing(null);
      toast.success('Saved');
    },
    onError: (e: any) => toast.error(e?.message || 'Unable to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Deleted');
    },
  });

  const openNew = () => {
    setEditing({ customer_name: '', city: '', rating: 5, comment: '', sort_order: 0, is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Testimonials">
      <div className="flex items-center justify-between mb-6">
        <p className="font-body text-sm text-muted-foreground">{testimonials?.length || 0} testimonials</p>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Testimonial</Button>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Rating</th>
              <th className="text-left p-3 font-medium">Comment</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials?.map((t: any) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p>{t.customer_name}</p>
                  {t.city && <p className="text-xs text-muted-foreground">{t.city}</p>}
                </td>
                <td className="p-3">{t.rating}/5</td>
                <td className="p-3 text-muted-foreground max-w-md truncate">{t.comment}</td>
                <td className="p-3">{t.is_active ? 'Active' : 'Inactive'}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-accent rounded"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-muted-foreground">Loading...</div>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editing);
              }}
            >
              <div>
                <Label className="text-xs">Customer Name</Label>
                <Input value={editing.customer_name} onChange={(e) => setEditing({ ...editing, customer_name: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">City</Label>
                <Input value={editing.city || ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Rating (1-5)</Label>
                <Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Comment</Label>
                <textarea
                  value={editing.comment}
                  onChange={(e) => setEditing({ ...editing, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Sort Order</Label>
                <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminTestimonials;
