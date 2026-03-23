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

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: coupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (c: any) => {
      const payload = {
        code: c.code.toUpperCase(),
        description: c.description || null,
        discount_type: c.discount_type,
        discount_value: parseFloat(c.discount_value),
        min_order_amount: parseFloat(c.min_order_amount) || 0,
        max_uses: c.max_uses ? parseInt(c.max_uses) : null,
        expires_at: c.expires_at || null,
        is_active: c.is_active,
      };
      if (c.id) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); setDialogOpen(false); toast.success('Coupon saved'); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('coupons').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Deleted'); },
  });

  return (
    <AdminLayout title="Coupons">
      <div className="flex justify-between items-center mb-6">
        <p className="font-body text-sm text-muted-foreground">{coupons?.length || 0} coupons</p>
        <Button onClick={() => { setEditing({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '', expires_at: '', is_active: true }); setDialogOpen(true); }} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Coupon</Button>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium">Code</th>
              <th className="text-left p-3 font-medium">Discount</th>
              <th className="text-left p-3 font-medium">Min Order</th>
              <th className="text-left p-3 font-medium">Used</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-3 font-mono font-semibold">{c.code}</td>
                <td className="p-3 tabular-nums">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}</td>
                <td className="p-3 tabular-nums">${Number(c.min_order_amount).toFixed(2)}</td>
                <td className="p-3 tabular-nums">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing({ ...c, discount_value: String(c.discount_value), min_order_amount: String(c.min_order_amount), max_uses: c.max_uses ? String(c.max_uses) : '' }); setDialogOpen(true); }} className="p-1.5 hover:bg-accent rounded"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(c.id); }} className="p-1.5 hover:bg-destructive/10 rounded text-destructive ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-xl">{editing?.id ? 'Edit' : 'New'} Coupon</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div><Label className="font-body text-xs">Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} required /></div>
              <div><Label className="font-body text-xs">Description</Label><Input value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-xs">Type</Label>
                  <select value={editing.discount_type} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value })} className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div><Label className="font-body text-xs">Value</Label><Input type="number" step="0.01" value={editing.discount_value} onChange={(e) => setEditing({ ...editing, discount_value: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-xs">Min Order Amount</Label><Input type="number" step="0.01" value={editing.min_order_amount} onChange={(e) => setEditing({ ...editing, min_order_amount: e.target.value })} /></div>
                <div><Label className="font-body text-xs">Max Uses</Label><Input type="number" value={editing.max_uses} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value })} placeholder="Unlimited" /></div>
              </div>
              <div><Label className="font-body text-xs">Expires At</Label><Input type="datetime-local" value={editing.expires_at ? editing.expires_at.slice(0, 16) : ''} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /><Label className="font-body text-xs">Active</Label></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoupons;
