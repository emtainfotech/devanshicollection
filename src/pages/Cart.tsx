import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatINR, getShippingINR, GST_RATE, toINRValue } from '@/lib/pricing';

const Cart = () => {
  const { state, removeItem, updateQuantity, applyCoupon, removeCoupon, itemCount, subtotal, total } = useCart();
  const [couponInput, setCouponInput] = useState('');

  const subtotalINR = toINRValue(subtotal);
  const discountedINR = toINRValue(total);
  const discountAmountINR = subtotalINR - discountedINR;
  const shippingINR = getShippingINR(subtotalINR);
  const taxINR = discountedINR * GST_RATE;

  const handleCoupon = () => {
    if (couponInput.toUpperCase() === 'CHIC15') {
      applyCoupon('CHIC15', 15);
      toast.success('Coupon applied! 15% off');
    } else {
      toast.error('Invalid coupon code');
    }
    setCouponInput('');
  };

  if (itemCount === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-semibold mb-3">Your Bag is Empty</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Browse our collection and find something you love</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 btn-primary-gradient px-8 py-3 text-sm font-body font-medium tracking-wide hover:opacity-95 transition-colors active:scale-[0.97] rounded-md"
          >
            CONTINUE SHOPPING
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-semibold mb-8"
          style={{ lineHeight: '1.1' }}
        >
          Your Bag ({itemCount})
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {state.items.map((item) => {
              const discounted = item.price * (1 - item.discount / 100);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex gap-4 pb-6 border-b border-border"
                >
                  <Link to={`/product/${item.productId}`} className="w-24 aspect-[3/4] rounded-md overflow-hidden bg-secondary flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-body text-sm font-medium truncate">{item.name}</h3>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          {item.size} · {item.color}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-accent rounded-full transition-colors active:scale-90 flex-shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div className="inline-flex items-center border border-border rounded-md">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-accent transition-colors active:scale-90">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-body tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-accent transition-colors active:scale-90">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-body text-sm font-semibold tabular-nums">{formatINR(toINRValue(discounted * item.quantity))}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-secondary/50 rounded-lg p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-body bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleCoupon}
                  className="px-4 py-2 text-xs font-body font-medium btn-primary-gradient rounded-md hover:opacity-95 transition-colors active:scale-95"
                >
                  Apply
                </button>
              </div>
              {state.couponCode && (
                <div className="flex items-center justify-between text-xs font-body mb-4 bg-primary/5 px-3 py-2 rounded-md">
                  <span className="text-primary font-medium">Coupon: {state.couponCode} (-{state.couponDiscount}%)</span>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                </div>
              )}

              <div className="space-y-3 text-sm font-body border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatINR(subtotalINR)}</span>
                </div>
                {state.couponDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatINR(discountAmountINR)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="tabular-nums">{shippingINR === 0 ? 'Free' : formatINR(shippingINR)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="tabular-nums">{formatINR(taxINR)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-semibold text-base">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(discountedINR + shippingINR + taxINR)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 btn-primary-gradient py-3.5 mt-6 text-sm font-body font-medium tracking-wide hover:opacity-95 transition-colors active:scale-[0.97] rounded-md"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link to="/products" className="block text-center text-xs font-body text-muted-foreground underline underline-offset-4 mt-4 hover:text-foreground">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
