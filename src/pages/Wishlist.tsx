import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { SAMPLE_PRODUCTS } from '@/lib/constants';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { items } = useWishlist();
  const wishlistProducts = SAMPLE_PRODUCTS.filter((p) => items.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-semibold mb-3">Your Wishlist is Empty</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Save your favorite items for later</p>
          <Link
            to="/products"
            className="inline-flex bg-foreground text-background px-8 py-3 text-sm font-body font-medium tracking-wide hover:bg-foreground/90 transition-colors active:scale-[0.97] rounded-md"
          >
            BROWSE PRODUCTS
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-4xl font-semibold mb-8" style={{ lineHeight: '1.1' }}>
          Wishlist ({wishlistProducts.length})
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
