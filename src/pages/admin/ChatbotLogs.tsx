import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const AdminChatbotLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-chatbot-logs'],
    queryFn: async () => {
      return await api.get('/admin/chatbot-logs');
    },
  });

  return (
    <AdminLayout title="Chatbot Activity">
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Question</th>
              <th className="text-left p-3 font-medium">Answer</th>
              <th className="text-left p-3 font-medium">Page</th>
              <th className="text-left p-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((row: any) => (
              <tr key={row.id} className="border-b border-border last:border-0 align-top">
                <td className="p-3 text-xs">{row.user_id ? `${row.user_id.slice(0, 8)}...` : 'Guest'}</td>
                <td className="p-3 max-w-xs">{row.question}</td>
                <td className="p-3 max-w-xs text-muted-foreground">{row.answer}</td>
                <td className="p-3 text-xs text-muted-foreground">{row.page_url || '—'}</td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(row.created_at)}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && !isLoading && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No chatbot activity yet</td></tr>
            )}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-muted-foreground">Loading...</div>}
      </div>
    </AdminLayout>
  );
};

export default AdminChatbotLogs;
