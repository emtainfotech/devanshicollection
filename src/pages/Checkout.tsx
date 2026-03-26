import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { formatINR, getShippingINR, GST_RATE, toINRValue, USD_TO_INR } from '@/lib/pricing';
import { api } from '@/lib/api';

type ShippingForm = {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, subtotal, total, clearCart, itemCount } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [form, setForm] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const subtotalINR = toINRValue(subtotal);
  const discountINR = toINRValue(subtotal - total);
  const shippingINR = getShippingINR(subtotalINR);
  const gstINR = (subtotalINR - discountINR) * GST_RATE;
  const grandTotalINR = subtotalINR - discountINR + shippingINR + gstINR;

  const canPlace = useMemo(() => {
    return !!(
      form.fullName &&
      form.phone &&
      form.addressLine1 &&
      form.city &&
      form.state &&
      form.pincode &&
      itemCount > 0 &&
      user
    );
  }, [form, itemCount, user]);

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to place order');
      navigate('/account');
      return;
    }
    if (itemCount === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
      return;
    }

    setPlacingOrder(true);
    try {
      const items = state.items.map((item) => {
        const unitPrice = item.price * (1 - item.discount / 100);
        return {
          product_id: item.productId,
          product_name: item.name,
          product_image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: unitPrice * item.quantity,
        };
      });

      const response = await api.post('/orders', {
        items,
        coupon_code: state.couponCode,
        shipping_address: {
          full_name: form.fullName,
          phone: form.phone,
          address_line1: form.addressLine1,
          city: form.city,
          state: form.state,
          postal_code: form.pincode,
          country: 'India',
        },
        totals: {
          subtotal: total,
          discount_amount: subtotal - total,
          shipping_amount: shippingINR / USD_TO_INR,
          tax_amount: gstINR / USD_TO_INR,
          total_amount: grandTotalINR / USD_TO_INR,
        },
      });

      const orderId = response.id;
      
      // Call payment API
      const payResponse = await api.post('/pay', { order_id: orderId });
      
      if (payResponse.redirectUrl) {
        clearCart();
        window.location.href = payResponse.redirectUrl;
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Unable to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-xl text-center">
          <h1 className="font-display text-4xl font-semibold">Checkout</h1>
          <p className="font-body text-sm text-muted-foreground mt-3">Please sign in before placing your order.</p>
          <Link to="/account" className="inline-flex mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-body font-medium">
            Go to Login
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-4xl font-semibold mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-5">
            <div className="rounded-lg border border-border p-5 bg-card">
              <h2 className="font-display text-2xl font-semibold mb-4">Shipping Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input className="px-3 py-2.5 rounded-md border border-input bg-background text-sm" placeholder="Full name" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
                <input className="px-3 py-2.5 rounded-md border border-input bg-background text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} required />
                <input className="md:col-span-2 px-3 py-2.5 rounded-md border border-input bg-background text-sm" placeholder="Address" value={form.addressLine1} onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))} required />
                <input className="px-3 py-2.5 rounded-md border border-input bg-background text-sm" placeholder="City" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} required />
                <input className="px-3 py-2.5 rounded-md border border-input bg-background text-sm" placeholder="State" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} required />
                <input className="px-3 py-2.5 rounded-md border border-input bg-background text-sm" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))} required />
              </div>
            </div>

            <div className="rounded-lg border border-border p-5 bg-card">
              <h2 className="font-display text-2xl font-semibold mb-2">Payment</h2>
              <p className="font-body text-sm text-muted-foreground">Payment Gateway Coming Soon</p>
            </div>

            <button
              type="submit"
              disabled={!canPlace || placingOrder}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-md text-sm font-body font-medium disabled:opacity-50"
            >
              {placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <aside className="rounded-lg border border-border p-5 bg-card h-fit sticky top-24">
            <h2 className="font-display text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm font-body">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{item.name} x {item.quantity}</span>
                  <span>{formatINR(toINRValue(item.price * (1 - item.discount / 100) * item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm font-body">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotalINR)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{formatINR(discountINR)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span>{formatINR(gstINR)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingINR === 0 ? 'Free' : formatINR(shippingINR)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total</span><span>{formatINR(grandTotalINR)}</span></div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
