import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { formatINR, toINRValue } from '@/lib/pricing';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, AlertTriangle, ChevronDown, ChevronUp, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const AdminComplaints = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedComplaints, setExpandedComplaints] = useState<string[]>([]);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: async () => {
      return await api.get('/admin/complaints');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.patch(`/admin/complaints/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      toast.success('Complaint updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update complaint'),
  });

  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    return complaints.filter((c: any) => {
      const searchLower = search.toLowerCase();
      return (
        c.order_id.toLowerCase().includes(searchLower) ||
        (c.customer_email || '').toLowerCase().includes(searchLower) ||
        (c.utr_number || '').toLowerCase().includes(searchLower)
      );
    });
  }, [complaints, search]);

  const toggleComplaint = (id: string) => {
    setExpandedComplaints(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleUpdate = (id: string, status: string) => {
    updateMutation.mutate({ id, data: { status, admin_remarks: remarks[id] || '' } });
  };

  return (
    <AdminLayout title="Payment Complaints">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Input 
            placeholder="Search by Order ID, Email, or UTR..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 font-body text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-4 font-body">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">No complaints found.</div>
        ) : (
          filteredComplaints.map((c: any) => (
            <div key={c.id} className="bg-background rounded-lg border border-border overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => toggleComplaint(c.id)}
              >
                <div className="flex items-center gap-4">
                  {expandedComplaints.includes(c.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <div>
                    <p className="font-bold">Order #{c.order_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{c.customer_email} · {formatDate(c.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-bold">{formatINR(toINRValue(Number(c.total_amount)))}</p>
                    <p className="text-xs text-muted-foreground">UTR: {c.utr_number || 'N/A'}</p>
                  </div>
                  <Badge variant={c.status === 'pending' ? 'outline' : c.status === 'resolved' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                    {c.status}
                  </Badge>
                </div>
              </div>

              <AnimatePresence>
                {expandedComplaints.includes(c.id) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-secondary/5"
                  >
                    <div className="p-6 grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Complaint Reason</h4>
                          <p className="text-sm bg-background p-3 rounded border border-border">{c.complaint_reason}</p>
                        </div>
                        {c.image_url && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Screenshot</h4>
                            <a href={c.image_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
                              <ImageIcon className="h-4 w-4" /> View Image <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Full Order ID</h4>
                          <p className="text-xs font-mono">{c.order_id}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Admin Remarks</h4>
                          <Textarea 
                            placeholder="Add internal remarks or reply..."
                            value={remarks[c.id] !== undefined ? remarks[c.id] : c.admin_remarks || ''}
                            onChange={(e) => setRemarks(prev => ({ ...prev, [c.id]: e.target.value }))}
                            className="text-sm h-24"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleUpdate(c.id, 'resolved')} 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            Mark as Resolved
                          </Button>
                          <Button 
                            onClick={() => handleUpdate(c.id, 'rejected')} 
                            variant="destructive"
                            className="flex-1"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;
