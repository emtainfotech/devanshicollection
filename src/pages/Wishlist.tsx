import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useWishlistProducts } from '@/hooks/useData';
import { Heart, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Wishlist = () => {
  const { items } = useWishlist();
  const { data: wishlistProducts, isLoading } = useWishlistProducts(items);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!wishlistProducts || wishlistProducts.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 tracking-tight">Your Wishlist is Empty</h1>
          <p className="font-body text-muted-foreground mb-10 max-w-sm mx-auto">Save items you love here to find them easily later.</p>
          <Link
            to="/products"
            className="inline-flex bg-primary text-primary-foreground px-10 py-4 rounded-full font-body text-sm font-bold tracking-widest uppercase hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
          >
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            My Wishlist
            <span className="ml-3 text-lg font-body text-muted-foreground font-medium">({wishlistProducts.length})</span>
          </h1>
          <Link to="/cart" className="flex items-center gap-2 text-sm font-body font-bold text-primary hover:text-primary/80 transition-colors">
            <ShoppingBag className="h-4 w-4" />
            GO TO BAG
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
