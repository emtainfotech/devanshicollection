import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatINR, toINRValue } from '@/lib/pricing';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, CreditCard, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AdminTransactions = () => {
  const [search, setSearch] = useState('');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      return await api.get('/admin/transactions');
    },
  });

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t: any) => {
      const searchLower = search.toLowerCase();
      return (
        t.order_id.toLowerCase().includes(searchLower) ||
        (t.customer_email || '').toLowerCase().includes(searchLower) ||
        (t.provider_transaction_id || '').toLowerCase().includes(searchLower)
      );
    });
  }, [transactions, search]);

  return (
    <AdminLayout title="Transactions">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Input 
            placeholder="Search by Order ID, Email, or Provider ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 font-body text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium">Order ID</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Provider ID</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Method</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading transactions...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No transactions found.</td></tr>
              ) : (
                filteredTransactions.map((t: any) => (
                  <tr key={t.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium">#{t.order_id.slice(0, 8)}</td>
                    <td className="p-4">
                      <p className="font-medium">{t.customer_email}</p>
                    </td>
                    <td className="p-4 text-xs font-mono text-muted-foreground">{t.provider_transaction_id}</td>
                    <td className="p-4 font-bold">{formatINR(toINRValue(Number(t.amount)))}</td>
                    <td className="p-4">
                      <Badge variant={t.status === 'success' ? 'default' : t.status === 'pending' ? 'outline' : 'destructive'} className="uppercase text-[10px]">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs uppercase font-medium">{t.payment_method_type || t.provider}</td>
                    <td className="p-4 text-xs text-muted-foreground">{formatDate(t.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTransactions;
