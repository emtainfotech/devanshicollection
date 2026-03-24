import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogOut, Package, Heart, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatINR, toINRValue } from '@/lib/pricing';

const Account = () => {
  const { user, loading, signIn, signInWithGoogle, signUp, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirst, setRegFirst] = useState('');
  const [regLast, setRegLast] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: orders } = useQuery({
    queryKey: ['my-orders', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-24 text-center font-body text-muted-foreground">Loading...</div></Layout>;
  }

  if (user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="font-display text-4xl font-semibold mb-8" style={{ lineHeight: '1.1' }}>My Account</h1>
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-body font-medium">{user.email}</p>
                <p className="font-body text-xs text-muted-foreground">Member since {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link to="/wishlist" className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
              <Heart className="h-5 w-5 text-primary mb-2" />
              <p className="font-body text-sm font-medium">Wishlist</p>
            </Link>
            <div className="bg-card border border-border rounded-lg p-5">
              <Package className="h-5 w-5 text-gold mb-2" />
              <p className="font-body text-sm font-medium">Orders</p>
              <p className="font-body text-xs text-muted-foreground mt-1">View order history</p>
            </div>
            {isAdmin && (
              <Link to="/admin" className="bg-primary/5 border border-primary/20 rounded-lg p-5 hover:shadow-md transition-shadow">
                <p className="font-body text-sm font-semibold text-primary">Admin Panel →</p>
                <p className="font-body text-xs text-muted-foreground mt-1">Manage your store</p>
              </Link>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="font-display text-2xl font-semibold mb-4">My Orders</h2>
            {!orders || orders.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
                  const activeStep = Math.max(0, steps.indexOf(order.status.toLowerCase()));
                  return (
                    <div key={order.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <p className="text-xs font-body text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm font-body font-semibold">{formatINR(toINRValue(Number(order.total_amount)))}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {steps.map((step, idx) => (
                          <div key={step} className="space-y-1">
                            <div className={`h-1.5 rounded-full ${idx <= activeStep ? 'bg-primary' : 'bg-secondary'}`} />
                            <p className={`text-[10px] uppercase tracking-wide font-body ${idx <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </Layout>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await signIn(loginEmail, loginPassword);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }

    const userId = data?.user?.id;
    if (userId) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) {
        toast.success('Welcome admin!');
        navigate('/admin');
        return;
      }
    }

    toast.success('Welcome back!');
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(regEmail, regPassword, { first_name: regFirst, last_name: regLast });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Account created! Check your email to confirm.');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl font-semibold text-center mb-8" style={{ lineHeight: '1.1' }}>Welcome Back</h1>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
              <TabsTrigger value="login" className="font-body text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="font-body text-sm">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await signInWithGoogle();
                    if (error) toast.error(error.message);
                  }}
                  className="w-full border border-border bg-background py-3 text-sm font-body font-medium rounded-md hover:bg-accent transition-colors"
                >
                  CONTINUE WITH GOOGLE
                </button>
                <div className="text-center text-xs text-muted-foreground font-body">or continue with email</div>
                <div><Label className="font-body text-sm">Email</Label><Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your@email.com" className="mt-1.5" required /></div>
                <div><Label className="font-body text-sm">Password</Label><Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" required /></div>
                <button type="submit" disabled={submitting} className="w-full btn-primary-gradient py-3 text-sm font-body font-medium tracking-wide hover:opacity-95 transition-colors active:scale-[0.97] rounded-md disabled:opacity-50">
                  {submitting ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="font-body text-sm">First Name</Label><Input value={regFirst} onChange={(e) => setRegFirst(e.target.value)} placeholder="Jane" className="mt-1.5" required /></div>
                  <div><Label className="font-body text-sm">Last Name</Label><Input value={regLast} onChange={(e) => setRegLast(e.target.value)} placeholder="Smith" className="mt-1.5" required /></div>
                </div>
                <div><Label className="font-body text-sm">Email</Label><Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="your@email.com" className="mt-1.5" required /></div>
                <div><Label className="font-body text-sm">Password</Label><Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" required minLength={6} /></div>
                <button type="submit" disabled={submitting} className="w-full btn-primary-gradient py-3 text-sm font-body font-medium tracking-wide hover:opacity-95 transition-colors active:scale-[0.97] rounded-md disabled:opacity-50">
                  {submitting ? 'CREATING...' : 'CREATE ACCOUNT'}
                </button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Account;
