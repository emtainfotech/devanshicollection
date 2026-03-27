import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogOut, Package, Heart, User, ChevronDown, ChevronUp, Truck, FileText, Clock, AlertCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatINR, toINRValue } from '@/lib/pricing';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddressManager from '@/components/account/AddressManager';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const OrderTimeline = ({ order }: { order: any }) => {
  const isCancelled = order.status.toLowerCase() === 'cancelled';
  const isReturned = order.status.toLowerCase() === 'returned';
  const isRefunded = order.status.toLowerCase() === 'refunded';

  if (isCancelled || isReturned || isRefunded) return null;

  const steps = [
    { label: 'Order Booked', status: 'pending', date: order.created_at, icon: Package },
    { label: 'Confirmed', status: 'confirmed', date: order.status !== 'pending' ? order.updated_at : null, icon: Clock },
    { label: 'Shipped', status: 'shipped', date: order.shipped_at, icon: Truck },
    { label: 'Delivered', status: 'delivered', date: order.delivered_at, icon: CheckCircle2 },
  ];

  const currentStatusIdx = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status.toLowerCase());

  return (
    <div className="space-y-6">
      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> Order Timeline
      </h4>
      <div className="relative pl-6 space-y-8 border-l-2 border-secondary ml-3">
        {steps.map((step, idx) => {
          const isDone = idx <= currentStatusIdx;
          const StepIcon = step.icon;
          
          return (
            <div key={idx} className="relative">
              <div className={`absolute -left-[33px] top-0 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center transition-colors ${isDone ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                <StepIcon className="h-3 w-3" />
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-semibold font-body leading-none ${isDone ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-[10px] text-muted-foreground font-body">
                    {formatDate(step.date)}
                  </p>
                )}
                {!step.date && isDone && (
                   <p className="text-[10px] text-muted-foreground font-body italic">
                    In progress
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReturnRequestDialog = ({ orderId, status, deliveredAt }: { orderId: string, status: string, deliveredAt?: string }) => {
  const [type, setType] = useState<'return' | 'refund'>('return');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // Check 5-day window
  const canRequest = () => {
    if (status !== 'delivered' || !deliveredAt) return false;
    const deliveredDate = new Date(deliveredAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - deliveredDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 5;
  };

  if (!canRequest()) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/order-requests', {
        order_id: orderId,
        type,
        reason,
        details,
      });
      toast.success('Request submitted successfully. Our team will contact you.');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-md text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-all active:scale-95">
          <RotateCcw className="h-3.5 w-3.5" /> Return / Refund
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Return or Refund</DialogTitle>
          <p className="text-xs text-muted-foreground">Please provide the details for your return or refund request.</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Request Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="return">Return Product</SelectItem>
                <SelectItem value="refund">Request Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Size/Fit issue">Size/Fit issue</SelectItem>
                <SelectItem value="Damaged product">Damaged product</SelectItem>
                <SelectItem value="Different from image">Different from image</SelectItem>
                <SelectItem value="Quality not as expected">Quality not as expected</SelectItem>
                <SelectItem value="Wrong item received">Wrong item received</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Please provide more details..." required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ComplaintDialog = ({ orderId }: { orderId: string }) => {
  const [utr, setUtr] = useState('');
  const [reason, setReason] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/complaints', {
        order_id: orderId,
        utr_number: utr,
        complaint_reason: reason,
        image_url: imageUrl,
      });
      toast.success('Complaint raised successfully. Our team will review it.');
      setOpen(false);
      setUtr('');
      setReason('');
      setImageUrl('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to raise complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-xs font-medium text-destructive hover:underline">
          <AlertCircle className="h-3.5 w-3.5" /> Raise Payment Complaint
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Raise Payment Complaint</DialogTitle>
          <p className="text-xs text-muted-foreground">If you have encountered any payment issues, please provide the UTR and a description.</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="utr">UTR / Transaction ID</Label>
            <Input id="utr" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="Enter UTR number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Complaint</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the issue..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Payment Screenshot URL (Optional)</Label>
            <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Link to screenshot" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Account = () => {
  const { user, loading, signIn, signInWithGoogle, signUp, signOut, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirst, setRegFirst] = useState('');
  const [regLast, setRegLast] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // ... (rest of states)

  const { data: orders } = useQuery({
    queryKey: ['my-orders', user?.id],
    enabled: !!user,
    queryFn: async () => {
      return await api.get('/my-orders');
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await api.post(`/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel order');
    },
  });

  const toggleOrder = (id: string) => {
    setExpandedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) {
    return <Layout><div className="container mx-auto px-4 py-24 text-center font-body text-muted-foreground">Loading...</div></Layout>;
  }

  if (user) {
    return (
      <Layout>
        <SEO 
          title="My Account" 
          description="View your profile, track orders, and manage your account at Devanshi Collection."
        />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="font-display text-4xl font-semibold mb-8" style={{ lineHeight: '1.1' }}>My Account</h1>
          {/* ... (profile card) */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-body font-medium">{user.email}</p>
                {user.phone && <p className="font-body text-sm text-muted-foreground">{user.phone}</p>}
                <p className="font-body text-xs text-muted-foreground">Member since {formatDate(user.created_at)}</p>
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

          <AddressManager />

          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="font-display text-2xl font-semibold mb-4">My Orders</h2>
            {!orders || orders.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const isCancelled = order.status.toLowerCase() === 'cancelled';
                  const isReturned = order.status.toLowerCase() === 'returned';
                  const isRefunded = order.status.toLowerCase() === 'refunded';
                  
                  const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
                  const activeStep = Math.max(0, steps.indexOf(order.status.toLowerCase()));
                  const isExpanded = expandedOrders.includes(order.id);

                  return (
                    <div key={order.id} className={`rounded-lg border border-border overflow-hidden ${isCancelled ? 'opacity-75 bg-secondary/5' : ''}`}>
                      <div 
                        className="p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                        onClick={() => toggleOrder(order.id)}
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <p className="text-xs font-body font-medium">Order #{order.id.slice(0, 8)}</p>
                            {isCancelled && <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Cancelled</span>}
                            {isReturned && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Returned</span>}
                            {isRefunded && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Refunded</span>}
                          </div>
                          <p className="text-sm font-body font-bold">{formatINR(toINRValue(Number(order.total_amount)))}</p>
                        </div>
                        
                        {!isCancelled && !isReturned && !isRefunded ? (
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {steps.map((step, idx) => (
                              <div key={step} className="space-y-1">
                                <div className={`h-1.5 rounded-full ${idx <= activeStep ? 'bg-primary' : 'bg-secondary'}`} />
                                <p className={`text-[10px] uppercase tracking-wide font-body font-semibold ${idx <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4">
                            <p className="text-xs font-body text-muted-foreground italic">
                              This order is {order.status.toLowerCase()}.
                            </p>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border bg-secondary/10"
                          >
                            <div className="p-4 space-y-6">
                              <OrderTimeline order={order} />
                              
                              {/* Tracking Info */}
                              {(order.tracking_number || order.status === 'shipped' || order.status === 'delivered') && (
                                <div className="bg-background p-4 rounded-lg border border-border border-l-4 border-l-primary">
                                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                    <Truck className="h-3.5 w-3.5" /> Tracking Details
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-xs font-body">
                                    <div>
                                      <p className="text-muted-foreground mb-1">Status</p>
                                      <p className="font-bold text-primary uppercase">{order.status}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground mb-1">Tracking Number</p>
                                      <p className="font-bold">{order.tracking_number || 'Awaiting update...'}</p>
                                    </div>
                                    {order.carrier && (
                                      <div>
                                        <p className="text-muted-foreground mb-1">Carrier</p>
                                        <p className="font-bold">{order.carrier}</p>
                                      </div>
                                    )}
                                    {order.shipped_at && (
                                      <div>
                                        <p className="text-muted-foreground mb-1">Shipped On</p>
                                        <p className="font-bold">{formatDate(order.shipped_at)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Order Items */}
                              <div>
                                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                  <Package className="h-3.5 w-3.5" /> Order Items
                                </h4>
                                <div className="space-y-3">
                                  {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex gap-3 items-center bg-background p-2 rounded-lg border border-border">
                                      <img src={item.product_image} alt={item.product_name} className="h-14 w-11 object-cover rounded-md" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">{item.size} · {item.color} · Qty: {item.quantity}</p>
                                      </div>
                                      <div className="text-sm font-semibold">{formatINR(toINRValue(item.unit_price * item.quantity))}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Summary & Invoice */}
                              <div className="pt-4 border-t border-border space-y-4">
                                <div className="flex items-end justify-between gap-4">
                                  <div className="space-y-1 text-xs font-body text-muted-foreground">
                                    <p>Placed on {formatDate(order.created_at)}</p>
                                    <p>Payment: <span className="font-bold uppercase text-primary">{order.payment_status}</span> via {order.payment_method}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {['pending', 'confirmed'].includes(order.status.toLowerCase()) && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button 
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground text-[10px] h-8"
                                            disabled={cancelOrderMutation.isPending}
                                          >
                                            Cancel Order
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This will permanently cancel your order #{order.id.slice(0, 8)}.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>No, keep order</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => cancelOrderMutation.mutate(order.id)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Yes, cancel order
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                    {order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
                                      <button 
                                        onClick={async () => {
                                          try {
                                            const { redirectUrl } = await api.post('/pay', { order_id: order.id });
                                            window.location.href = redirectUrl;
                                          } catch (e: any) {
                                            toast.error(e.message || 'Payment failed');
                                          }
                                        }}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                                      >
                                        Retry Payment
                                      </button>
                                    )}
                                    {order.status === 'delivered' && (
                                      <div className="flex flex-col gap-2">
                                        <button 
                                          onClick={() => window.open(`${api.BASE}/invoice/${order.id}`, '_blank')}
                                          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/90 transition-colors"
                                        >
                                          <FileText className="h-3.5 w-3.5" /> Download Invoice
                                        </button>
                                        <ReturnRequestDialog orderId={order.id} status={order.status} deliveredAt={order.delivered_at} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-end border-t border-border pt-3">
                                  <ComplaintDialog orderId={order.id} />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
    setSubmitting(false);
    try {
      const data = await signIn(loginEmail, loginPassword);
      if (String(data?.user?.role || '') === 'admin') {
        toast.success('Welcome admin!');
        navigate('/admin');
        return;
      }
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to login');
    }
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
      <SEO 
        title="My Account" 
        description="Manage your account, view order history, and update your addresses at Devanshi Collection."
      />
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
                  onClick={() => window.location.href = `${api.BASE}/auth/google`}
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
                <div><Label className="font-body text-sm">Phone Number (Optional)</Label><Input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="e.g. 9876543210" className="mt-1.5" /></div>
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
