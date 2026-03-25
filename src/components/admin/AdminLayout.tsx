import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, Grid3X3, Image, ShoppingCart, Tag, LogOut, ChevronLeft, MessageSquare, Settings, Bot, FileText } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Grid3X3 },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { label: 'Blogs', href: '/admin/blogs', icon: FileText },
  { label: 'Chatbot Activity', href: '/admin/chatbot-logs', icon: Bot },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, signOut, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-body text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-3xl font-semibold mb-3">Access Denied</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Link to="/account" className="font-body text-sm text-primary underline underline-offset-4">
            Sign in with an admin account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-body mb-3">
            <ChevronLeft className="h-3 w-3" /> Back to store
          </Link>
          <h2 className="font-display text-xl font-semibold">DEVANSHI COLLECTION</h2>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="flex items-center gap-3 px-3 py-2 text-sm font-body text-muted-foreground hover:text-foreground w-full rounded-md hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-background border-b border-border px-8 py-5">
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
