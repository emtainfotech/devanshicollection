import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp, MessageCircle, Mail, Phone, Clock, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved', 'closed'];

const AdminCustomerCare = () => {
  const queryClient = useQueryClient();
  const [expandedQueries, setExpandedQueries] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: queries, isLoading } = useQuery({
    queryKey: ['admin-customer-queries'],
    queryFn: async () => {
      return await api.get('/admin/customer-queries');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.patch(`/admin/customer-queries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-queries'] });
      toast.success('Query updated successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update query'),
  });

  const filteredQueries = useMemo(() => {
    if (!queries) return [];
    return queries.filter((q: any) => {
      const searchLower = search.toLowerCase();
      const idMatch = q.id.toLowerCase().includes(searchLower);
      const emailMatch = (q.email || '').toLowerCase().includes(searchLower);
      const nameMatch = (q.name || '').toLowerCase().includes(searchLower);
      const subjectMatch = (q.subject || '').toLowerCase().includes(searchLower);
      const statusMatch = filterStatus === 'all' || q.status === filterStatus;
      return (idMatch || emailMatch || nameMatch || subjectMatch) && statusMatch;
    });
  }, [queries, search, filterStatus]);

  const toggleQuery = (id: string) => {
    setExpandedQueries(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <AdminLayout title="Customer Care Queries">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Input 
            placeholder="Search Name, Email, Subject..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Subject</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries?.map((q: any) => (
              <>
                <tr 
                  key={q.id} 
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer" 
                  onClick={() => toggleQuery(q.id)}
                >
                  <td className="p-3 text-center">
                    {expandedQueries.includes(q.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.email}</p>
                  </td>
                  <td className="p-3 font-medium text-primary">{q.subject}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 capitalize">
                      {getStatusIcon(q.status)}
                      <span className="font-medium">{q.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{formatDate(q.created_at)}</td>
                </tr>
                {expandedQueries.includes(q.id) && (
                  <tr className="bg-secondary/20 border-b border-border">
                    <td colSpan={5} className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                              <MessageCircle className="h-3 w-3" /> Message Details
                            </h4>
                            <div className="bg-background p-4 rounded-md border border-border space-y-4">
                              <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Subject</p>
                                <p className="text-sm font-medium">{q.subject}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Message</p>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{q.message}</p>
                              </div>
                              {q.phone && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" /> {q.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                              <User className="h-3 w-3" /> Resolution
                            </h4>
                            <div className="bg-background p-4 rounded-md border border-border space-y-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Admin Remarks</Label>
                                <Textarea 
                                  placeholder="Enter resolution notes..."
                                  value={q.admin_remarks || ''}
                                  onChange={(e) => updateMutation.mutate({ id: q.id, data: { admin_remarks: e.target.value, status: q.status } })}
                                  className="text-sm h-24"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {STATUS_OPTIONS.map((s) => (
                                  <Button
                                    key={s}
                                    variant={q.status === s ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateMutation.mutate({ id: q.id, data: { status: s, admin_remarks: q.admin_remarks } });
                                    }}
                                    className="capitalize text-xs h-9"
                                  >
                                    {s.replace('_', ' ')}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {(!filteredQueries || filteredQueries.length === 0) && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customer queries found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomerCare;
