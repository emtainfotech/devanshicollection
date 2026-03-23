import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, orders, categories, coupons] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount'),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('coupons').select('id', { count: 'exact', head: true }),
      ]);

      const totalRevenue = (orders.data || []).reduce((sum, o) => sum + Number(o.total_amount), 0);

      return {
        products: products.count || 0,
        orders: orders.data?.length || 0,
        categories: categories.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const cards = [
    { label: 'Products', value: stats?.products || 0, icon: Package, color: 'text-primary' },
    { label: 'Orders', value: stats?.orders || 0, icon: ShoppingCart, color: 'text-gold' },
    { label: 'Categories', value: stats?.categories || 0, icon: Users, color: 'text-rose' },
    { label: 'Revenue', value: `$${(stats?.revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-background rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-body text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="font-display text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-background rounded-lg border border-border p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/admin/products' },
            { label: 'Manage Categories', href: '/admin/categories' },
            { label: 'Update Banners', href: '/admin/banners' },
            { label: 'View Orders', href: '/admin/orders' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="bg-secondary text-center py-3 px-4 rounded-md text-sm font-body font-medium hover:bg-accent transition-colors"
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
