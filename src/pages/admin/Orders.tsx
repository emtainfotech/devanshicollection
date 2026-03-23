import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['unpaid', 'paid', 'refunded'];

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(first_name, last_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string }) => {
      const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Updated'); },
  });

  return (
    <AdminLayout title="Orders">
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium">Order ID</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Payment</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                <td className="p-3">{(o as any).profiles?.first_name} {(o as any).profiles?.last_name}</td>
                <td className="p-3 tabular-nums">${Number(o.total_amount).toFixed(2)}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateMutation.mutate({ id: o.id, field: 'status', value: e.target.value })} className="text-xs border border-input rounded px-2 py-1 bg-background">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select value={o.payment_status} onChange={(e) => updateMutation.mutate({ id: o.id, field: 'payment_status', value: e.target.value })} className="text-xs border border-input rounded px-2 py-1 bg-background">
                    {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
