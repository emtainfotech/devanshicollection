import { FormEvent, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowRight, Plus } from 'lucide-react';
import { formatINR, getShippingINR, GST_RATE, toINRValue, USD_TO_INR } from '@/lib/pricing';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

type Address = {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, subtotal, total, clearCart, itemCount } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/my-addresses'),
    enabled: !!user,
  });

  useEffect(() => {
    if (addresses && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(() => {
    return addresses?.find(a => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const subtotalINR = toINRValue(subtotal);
  const discountINR = toINRValue(subtotal - total);
  const shippingINR = getShippingINR(subtotalINR);
  const gstINR = (subtotalINR - discountINR) * GST_RATE;
  const grandTotalINR = subtotalINR - discountINR + shippingINR + gstINR;

  const canPlace = useMemo(() => {
    return !!(selectedAddressId && itemCount > 0 && user);
  }, [selectedAddressId, itemCount, user]);

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
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
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
        shipping_address: selectedAddress,
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
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-lg border border-border p-5 bg-card">
              <h2 className="font-display text-2xl font-semibold mb-4">Shipping Address</h2>
              {addressesLoading ? (
                <p>Loading addresses...</p>
              ) : (
                <div className="space-y-4">
                  {addresses?.map(address => (
                    <div key={address.id} onClick={() => setSelectedAddressId(address.id)} className={`p-4 rounded-lg border cursor-pointer ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <p className="font-semibold">{address.full_name}</p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                      <p className="text-sm text-muted-foreground">{address.address_line1}, {address.city}, {address.state} - {address.postal_code}</p>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => navigate('/account')} className="w-full mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Manage Addresses
                  </Button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!canPlace || placingOrder}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-md text-sm font-body font-medium disabled:opacity-50"
            >
              {placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

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
