import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { useProduct, useProducts } from '@/hooks/useData';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart, ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR, toINRValue } from '@/lib/pricing';

const ProductDetail = () => {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug || '');
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const categorySlug = (product as any)?.categories?.slug;
  const { data: relatedProducts } = useProducts({ categorySlug, limit: 4 });
  const related = relatedProducts?.filter((p) => p.id !== product?.id).slice(0, 4) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 animate-pulse">
            <div className="aspect-[3/4] bg-secondary rounded-lg" />
            <div className="space-y-4"><div className="h-8 bg-secondary rounded w-3/4" /><div className="h-4 bg-secondary rounded w-1/4" /><div className="h-6 bg-secondary rounded w-1/3" /></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
          <Link to="/products" className="font-body text-sm text-primary underline">Browse all products</Link>
        </div>
      </Layout>
    );
  }

  const price = Number(product.price);
  const discountedPrice = price * (1 - (product.discount || 0) / 100);
  const wishlisted = isInWishlist(product.id);
  const images = product.images || [];

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    const item: CartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price,
      discount: product.discount || 0,
      image: images[0] || '',
      size: selectedSize,
      color: selectedColor,
      quantity,
    };
    addItem(item);
    toast.success('Added to bag');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link><span>/</span>
          <Link to="/products" className="hover:text-foreground">Shop</Link><span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary mb-3">
              <img src={images[selectedImage] || ''} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 aspect-[3/4] rounded-md overflow-hidden border-2 ${i === selectedImage ? 'border-foreground' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col">
            <h1 className="font-display text-3xl md:text-4xl font-semibold" style={{ lineHeight: '1.1' }}>{product.name}</h1>

            {product.rating && Number(product.rating) > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(product.rating)) ? 'fill-gold text-gold' : 'text-border'}`} />)}
                </div>
                <span className="text-sm font-body text-muted-foreground">{product.rating} · {product.review_count} reviews</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              {(product.discount || 0) > 0 ? (
                <>
                  <span className="font-display text-2xl font-semibold text-primary">{formatINR(toINRValue(discountedPrice))}</span>
                  <span className="font-body text-lg text-muted-foreground line-through">{formatINR(toINRValue(price))}</span>
                  <span className="font-body text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">Save {product.discount}%</span>
                </>
              ) : (
                <span className="font-display text-2xl font-semibold">{formatINR(toINRValue(price))}</span>
              )}
            </div>

            <p className="font-body text-sm text-muted-foreground mt-4 leading-relaxed">{product.description}</p>

            <div className="mt-8">
              <h3 className="font-body text-sm font-semibold mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size: string) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-sm font-body border rounded-md transition-all active:scale-95 ${selectedSize === size ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-body text-sm font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors?.map((color: string) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 text-sm font-body border rounded-md transition-all active:scale-95 ${selectedColor === color ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-body text-sm font-semibold mb-3">Quantity</h3>
              <div className="inline-flex items-center border border-border rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-accent transition-colors active:scale-90"><Minus className="h-4 w-4" /></button>
                <span className="px-5 py-2 text-sm font-body tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 hover:bg-accent transition-colors active:scale-90"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <p className="mt-4 text-xs font-body text-muted-foreground">
              {(product.stock || 0) > 10 ? 'In Stock' : (product.stock || 0) > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </p>

            <div className="flex gap-3 mt-8">
              <button onClick={handleAddToCart} disabled={(product.stock || 0) === 0} className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3.5 text-sm font-body font-medium tracking-wide hover:bg-foreground/90 transition-colors active:scale-[0.97] disabled:opacity-50 rounded-md">
                <ShoppingBag className="h-4 w-4" /> ADD TO BAG
              </button>
              <button onClick={() => { toggleItem(product.id); toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }} className="p-3.5 border border-border rounded-md hover:bg-accent transition-colors active:scale-95">
                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 mb-10">
            <h2 className="font-display text-3xl font-semibold mb-8" style={{ lineHeight: '1.1' }}>You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
