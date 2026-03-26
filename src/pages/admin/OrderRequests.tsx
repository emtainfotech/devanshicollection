import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { formatINR, toINRValue } from '@/lib/pricing';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp, RotateCcw, User, Package, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'completed'];

const AdminOrderRequests = () => {
  const queryClient = useQueryClient();
  const [expandedRequests, setExpandedRequests] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-order-requests'],
    queryFn: async () => {
      return await api.get('/admin/order-requests');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.patch(`/admin/order-requests/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-requests'] });
      toast.success('Request updated successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update request'),
  });

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    return requests.filter((r: any) => {
      const searchLower = search.toLowerCase();
      const idMatch = r.order_id.toLowerCase().includes(searchLower) || r.id.toLowerCase().includes(searchLower);
      const emailMatch = (r.customer_email || '').toLowerCase().includes(searchLower);
      const statusMatch = filterStatus === 'all' || r.status === filterStatus;
      return (idMatch || emailMatch) && statusMatch;
    });
  }, [requests, search, filterStatus]);

  const toggleRequest = (id: string) => {
    setExpandedRequests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <AdminLayout title="Returns & Refunds">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Input 
            placeholder="Search Order ID, Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <RotateCcw className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="w-10 p-3"></th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Order ID</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests?.map((r: any) => (
              <>
                <tr 
                  key={r.id} 
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer" 
                  onClick={() => toggleRequest(r.id)}
                >
                  <td className="p-3 text-center">
                    {expandedRequests.includes(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </td>
                  <td className="p-3 capitalize font-semibold text-primary">{r.type}</td>
                  <td className="p-3 font-mono text-xs">#{r.order_id.slice(0, 8)}</td>
                  <td className="p-3">
                    <p className="font-medium">{r.first_name} {r.last_name}</p>
                    <p className="text-xs text-muted-foreground">{r.customer_email}</p>
                  </td>
                  <td className="p-3 tabular-nums font-semibold">{formatINR(toINRValue(Number(r.total_amount)))}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 capitalize">
                      {getStatusIcon(r.status)}
                      <span className="font-medium">{r.status}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{formatDate(r.created_at)}</td>
                </tr>
                {expandedRequests.includes(r.id) && (
                  <tr className="bg-secondary/20 border-b border-border">
                    <td colSpan={7} className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                              <AlertCircle className="h-3 w-3" /> Request Details
                            </h4>
                            <div className="bg-background p-4 rounded-md border border-border space-y-4">
                              <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Reason</p>
                                <p className="text-sm font-medium">{r.reason}</p>
                              </div>
                              {r.details && (
                                <div>
                                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Additional Information</p>
                                  <p className="text-sm text-muted-foreground">{r.details}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {r.images?.length > 0 && (
                            <div>
                              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                                <Package className="h-3 w-3" /> Attached Images
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {r.images.map((img: string, i: number) => (
                                  <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                    <img src={img} alt="" className="h-20 w-20 object-cover rounded-md border border-border hover:opacity-80 transition-opacity" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                              <User className="h-3 w-3" /> Take Action
                            </h4>
                            <div className="bg-background p-4 rounded-md border border-border space-y-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Admin Remarks</Label>
                                <Textarea 
                                  placeholder="Enter internal notes or message for customer..."
                                  value={r.admin_remarks || ''}
                                  onChange={(e) => updateMutation.mutate({ id: r.id, data: { admin_remarks: e.target.value, status: r.status } })}
                                  className="text-sm h-24"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {STATUS_OPTIONS.map((s) => (
                                  <Button
                                    key={s}
                                    variant={r.status === s ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateMutation.mutate({ id: r.id, data: { status: s, admin_remarks: r.admin_remarks } });
                                    }}
                                    className="capitalize text-xs h-9"
                                  >
                                    {s}
                                  </Button>
                                ))}
                              </div>
                              <p className="text-[10px] text-muted-foreground italic">
                                Note: Setting status to "completed" will automatically update the main Order status to "returned" or "refunded".
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {(!filteredRequests || filteredRequests.length === 0) && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No return or refund requests found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`block font-body ${className}`}>{children}</label>
);

export default AdminOrderRequests;
