import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR, toINRValue } from '@/lib/pricing';
import { api } from '@/lib/api';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      return await api.get('/admin/stats');
    },
  });

  const cards = [
    { label: 'Products', value: stats?.products || 0, icon: Package, color: 'text-primary' },
    { label: 'Orders', value: stats?.orders || 0, icon: ShoppingCart, color: 'text-gold' },
    { label: 'Categories', value: stats?.categories || 0, icon: Users, color: 'text-rose' },
    { label: 'Revenue', value: formatINR(toINRValue(stats?.revenue || 0)), icon: DollarSign, color: 'text-green-600' },
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
            <Link
              key={action.label}
              to={action.href}
              className="bg-secondary text-center py-3 px-4 rounded-md text-sm font-body font-medium hover:bg-accent transition-colors"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
