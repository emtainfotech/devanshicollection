import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminChatbotLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-chatbot-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) {
        if ((error as any).code === '42P01') {
          toast.error("Missing table: public.chatbot_messages. Run latest Supabase migration.");
          return [];
        }
        throw error;
      }
      return data;
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
                <td className="p-3 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</td>
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
