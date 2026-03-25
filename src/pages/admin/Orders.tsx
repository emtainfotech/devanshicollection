import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { formatINR, toINRValue } from '@/lib/pricing';
import { api } from '@/lib/api';
import { ChevronDown, ChevronUp, Package, Truck, ExternalLink, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['unpaid', 'paid', 'refunded'];

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', payment: 'all' });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      return await api.get('/admin/orders');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.patch(`/admin/orders/${id}`, data);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); 
      toast.success('Updated'); 
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update'),
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) => {
      const searchLower = search.toLowerCase();
      const idMatch = o.id.toLowerCase().includes(searchLower);
      const emailMatch = (o.customer_email || '').toLowerCase().includes(searchLower);
      const nameMatch = (o.shipping_address?.full_name || '').toLowerCase().includes(searchLower);
      const statusMatch = filters.status === 'all' || o.status === filters.status;
      const paymentMatch = filters.payment === 'all' || o.payment_status === filters.payment;
      return (idMatch || emailMatch || nameMatch) && statusMatch && paymentMatch;
    });
  }, [orders, search, filters]);

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Input 
            placeholder="Search by ID, email, name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.payment} onValueChange={(v) => setFilters(f => ({ ...f, payment: v }))}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              {PAYMENT_OPTIONS.map(p => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="w-10 p-3"></th>
              <th className="text-left p-3 font-medium">Order ID</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Payment</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((o) => (
              <>
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => toggleOrder(o.id)}>
                  <td className="p-3 text-center">
                    {expandedOrders.includes(o.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </td>
                  <td className="p-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                  <td className="p-3">
                    <p className="font-medium">{(o as any).shipping_address?.full_name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{(o as any).customer_email}</p>
                  </td>
                  <td className="p-3 tabular-nums font-semibold">{formatINR(toINRValue(Number(o.total_amount)))}</td>
                  <td className="p-3">
                    <select 
                      value={o.status} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateMutation.mutate({ id: o.id, data: { status: e.target.value } })} 
                      className={`text-xs border border-input rounded px-2 py-1 bg-background font-medium ${
                        o.status === 'delivered' ? 'text-green-600' : o.status === 'cancelled' ? 'text-red-600' : 'text-primary'
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <select 
                      value={o.payment_status} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateMutation.mutate({ id: o.id, data: { payment_status: e.target.value } })} 
                      className={`text-xs border border-input rounded px-2 py-1 bg-background font-medium ${
                        o.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
                {expandedOrders.includes(o.id) && (
                  <tr className="bg-secondary/20 border-b border-border">
                    <td colSpan={7} className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            <Package className="h-3 w-3" /> Order Items
                          </h4>
                          <div className="space-y-3">
                            {(o as any).items?.map((item: any) => (
                              <div key={item.id} className="flex gap-3 items-center bg-background p-2 rounded-md border border-border">
                                <img src={item.product_image} alt={item.product_name} className="h-12 w-10 object-cover rounded" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.product_name}</p>
                                  <p className="text-xs text-muted-foreground">{item.size} · {item.color} · Qty: {item.quantity}</p>
                                </div>
                                <div className="text-sm font-semibold">{formatINR(toINRValue(item.unit_price * item.quantity))}</div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-6 p-4 bg-background rounded-md border border-border space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatINR(toINRValue(o.subtotal))}</span></div>
                            {o.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({o.coupon_code})</span><span>-{formatINR(toINRValue(o.discount_amount))}</span></div>}
                            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{o.shipping_amount > 0 ? formatINR(toINRValue(o.shipping_amount)) : 'FREE'}</span></div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span>Total</span><span>{formatINR(toINRValue(o.total_amount))}</span></div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                              <Truck className="h-3 w-3" /> Shipping & Tracking
                            </h4>
                            <div className="bg-background p-4 rounded-md border border-border space-y-4">
                              <div className="text-sm">
                                <p className="font-semibold mb-1">Shipping Address</p>
                                <p className="text-muted-foreground">{(o as any).shipping_address?.address_line1}</p>
                                <p className="text-muted-foreground">{(o as any).shipping_address?.city}, {(o as any).shipping_address?.state} {(o as any).shipping_address?.postal_code}</p>
                                <p className="text-muted-foreground">Phone: {(o as any).shipping_address?.phone}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Carrier</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. BlueDart" 
                                    value={o.carrier || ''} 
                                    onChange={(e) => updateMutation.mutate({ id: o.id, data: { carrier: e.target.value } })}
                                    className="w-full text-xs border border-input rounded px-2 py-1.5 bg-background"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Tracking #</label>
                                  <input 
                                    type="text" 
                                    placeholder="Number" 
                                    value={o.tracking_number || ''} 
                                    onChange={(e) => updateMutation.mutate({ id: o.id, data: { tracking_number: e.target.value } })}
                                    className="w-full text-xs border border-input rounded px-2 py-1.5 bg-background"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                                {o.shipped_at && <div>Shipped: {new Date(o.shipped_at).toLocaleString()}</div>}
                                {o.delivered_at && <div>Delivered: {new Date(o.delivered_at).toLocaleString()}</div>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-secondary hover:bg-secondary/80 rounded-md text-xs font-medium transition-colors">
                              <ExternalLink className="h-3.5 w-3.5" /> View Full Order
                            </button>
                            {o.status === 'delivered' && (
                              <a href={`${api.BASE}/invoice/${o.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-medium transition-colors text-center">
                                Generate Invoice
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
