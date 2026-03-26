import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { useProduct, useProducts, useReviews } from '@/hooks/useData';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentViewed } from '@/hooks/useRecentViewed';
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, ShieldCheck, RotateCcw, Share2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { formatINR } from '@/lib/pricing';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const isValidImageSrc = (value: string) => {
  const v = String(value || '').trim();
  if (!v) return false;
  if (v.startsWith('data:image/') && v.includes(';base64,')) return true;
  if (/^https?:\/\//i.test(v)) return true;
  if (v.startsWith('/')) return true;
  return false;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug || '');
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { addProduct } = useRecentViewed();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (slug) {
      addProduct(slug);
    }
  }, [slug]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please login to write a review');
      const trimmedComment = reviewComment.trim();
      if (!trimmedComment) throw new Error('Please write a comment');
      await api.post('/reviews', { product_id: product?.id, rating: reviewRating, comment: trimmedComment });
    },
    onSuccess: () => {
      toast.success('Review submitted successfully');
      setReviewComment('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id] });
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to submit review'),
  });

  const categorySlug = (product as any)?.category_slug || (product as any)?.categories?.slug;
  const { data: relatedProducts } = useProducts({ categorySlug, limit: 5 });
  const { data: reviews } = useReviews(product?.id || '');
  const related = relatedProducts?.filter((p) => p.id !== product?.id).slice(0, 4) || [];

  const discountedPrice = useMemo(() => {
    if (!product) return 0;
    return product.price * (1 - (product.discount || 0) / 100);
  }, [product]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 animate-pulse">
            <div className="aspect-[3/4] bg-secondary rounded-xl" />
            <div className="space-y-6">
              <div className="h-10 bg-secondary rounded w-3/4" />
              <div className="h-6 bg-secondary rounded w-1/4" />
              <div className="h-24 bg-secondary rounded w-full" />
              <div className="h-12 bg-secondary rounded w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-4xl font-bold mb-6">Product Not Found</h1>
          <Link to="/products" className="inline-flex bg-primary text-primary-foreground px-8 py-3 rounded-full font-body text-sm font-semibold tracking-wide hover:bg-primary/90 transition-all">
            Back to Shop
          </Link>
        </div>
      </Layout>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const images = (product.images || []).filter((img: string) => isValidImageSrc(img));
  const videoUrl = String((product as any).video_url || '').trim();

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    const item: CartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount || 0,
      image: images[0] || '',
      size: selectedSize,
      color: selectedColor,
      quantity,
    };
    addItem(item);
    return item;
  };

  const onAddToCart = () => {
    handleAddToCart();
    toast.success('Added to your bag');
  };

  const handleBuyNow = () => {
    const item = handleAddToCart();
    if (item) {
      navigate('/checkout');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] md:text-xs font-body uppercase tracking-widest text-muted-foreground mb-10 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-border">/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Collection</Link>
          <span className="text-border">/</span>
          {categorySlug && (
            <>
              <Link to={`/products?category=${categorySlug}`} className="hover:text-primary transition-colors capitalize">{categorySlug.replace(/-/g, ' ')}</Link>
              <span className="text-border">/</span>
            </>
          )}
          <span className="text-foreground font-semibold truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:max-h-[700px]">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-secondary relative group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <button
                onClick={() => { toggleItem(product.id); toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                className="absolute top-6 right-6 p-3 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-all active:scale-90"
              >
                <Heart className={`h-6 w-6 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
              </button>
              {product.discount > 0 && (
                <div className="absolute top-6 left-6 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full shadow-lg uppercase tracking-wider">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-semibold">{product.rating || '4.8'}</span>
                </div>
                <span className="text-sm text-muted-foreground font-body">{product.review_count || '24'} reviews</span>
                <span className="text-border">|</span>
                <span className="text-sm text-primary font-semibold font-body">In Stock</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="font-display text-4xl font-bold text-foreground">{formatINR(discountedPrice)}</span>
              {product.discount > 0 && (
                <span className="font-body text-xl text-muted-foreground line-through decoration-primary/40">{formatINR(product.price)}</span>
              )}
            </div>

            {/* Selectors */}
            <div className="space-y-8 mb-10">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-widest">Select Size</h3>
                  <button className="text-xs font-body text-primary underline underline-offset-4 hover:text-primary/80">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes?.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[50px] h-12 flex items-center justify-center text-sm font-body border rounded-full transition-all active:scale-95 ${selectedSize === size ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary hover:text-primary'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest mb-4">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors?.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 h-12 flex items-center justify-center text-sm font-body border rounded-full transition-all active:scale-95 ${selectedColor === color ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary hover:text-primary'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest mb-4">Quantity</h3>
                <div className="inline-flex items-center bg-secondary rounded-full p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-background rounded-full transition-all active:scale-90"><Minus className="h-4 w-4" /></button>
                  <span className="w-12 text-center text-sm font-bold font-body tabular-nums">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-background rounded-full transition-all active:scale-90"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={onAddToCart}
                disabled={!product.stock}
                className="flex-1 h-14 bg-secondary text-foreground flex items-center justify-center gap-3 rounded-full text-base font-bold tracking-wide hover:bg-secondary/80 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <ShoppingBag className="h-5 w-5" />
                ADD TO BAG
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.stock}
                className="flex-[1.5] h-14 bg-primary text-primary-foreground flex items-center justify-center gap-3 rounded-full text-base font-bold tracking-wide hover:bg-primary/90 transition-all active:scale-[0.98] shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                BUY IT NOW
              </button>
              <button className="h-14 px-8 border-2 border-border rounded-full hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center justify-center gap-2">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-3 text-sm font-body">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Fast Shipping</p>
                  <p className="text-muted-foreground text-xs">Free on orders above ₹4,999</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm font-body">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Quality Assured</p>
                  <p className="text-muted-foreground text-xs">Premium materials and craftsmanship</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-display font-bold uppercase tracking-widest mb-4">Product Highlights</h3>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
                {['Premium Fabric', 'Handcrafted', 'Unique Design', 'Easy Maintenance', 'Perfect Fit', 'Ethically Made'].map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-24">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-8">
                  <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-display text-sm font-bold uppercase tracking-widest py-3 px-6">Description</TabsTrigger>
                  <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-display text-sm font-bold uppercase tracking-widest py-3 px-6">Material & Care</TabsTrigger>
                  <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-display text-sm font-bold uppercase tracking-widest py-3 px-6">Shipping & Returns</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-display text-sm font-bold uppercase tracking-widest py-3 px-6">Reviews ({reviews?.length || 0})</TabsTrigger>
                </TabsList>
                <div className="py-12">
                  <TabsContent value="description" className="mt-0 focus-visible:ring-0">
                    <div className="max-w-3xl prose prose-sm font-body text-muted-foreground">
                      <p className="text-base leading-relaxed">{product.description}</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="details" className="mt-0 focus-visible:ring-0">
                    <div className="max-w-3xl space-y-6">
                      <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-3">Material</h4>
                        <p className="font-body text-sm text-muted-foreground">Crafted from high-quality premium fabrics for ultimate comfort and durability. Each piece undergoes rigorous quality checks.</p>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-3">Care Instructions</h4>
                        <ul className="list-disc list-inside font-body text-sm text-muted-foreground space-y-2">
                          <li>Gentle hand wash recommended</li>
                          <li>Do not bleach</li>
                          <li>Dry in shade</li>
                          <li>Iron on low heat if needed</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="shipping" className="mt-0 focus-visible:ring-0">
                    <div className="max-w-3xl space-y-6">
                      <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-3">Shipping Info</h4>
                        <p className="font-body text-sm text-muted-foreground">Standard delivery within 3-5 business days. Express shipping available at checkout. Tracking details will be shared via email once shipped.</p>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-3">Returns Policy</h4>
                        <p className="font-body text-sm text-muted-foreground">7-day easy returns policy for unused items with original tags intact. Refund will be processed within 5-7 working days after quality check.</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-0 focus-visible:ring-0">
                <div className="space-y-6">
                  {/* Review Form */}
                  <div className="bg-secondary/30 rounded-2xl p-6">
                    <h4 className="font-display text-sm font-bold uppercase tracking-widest mb-4">Write a Review</h4>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button key={val} onClick={() => setReviewRating(val)}>
                          <Star className={`h-6 w-6 ${val <= reviewRating ? 'fill-primary text-primary' : 'text-border'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none mb-4"
                      rows={3}
                      placeholder="What did you think of the product?"
                    />
                    <button
                      onClick={() => submitReview.mutate()}
                      disabled={!user || submitReview.isPending}
                      className="bg-foreground text-background px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all disabled:opacity-50"
                    >
                      {!user ? 'Login to Review' : 'Submit Review'}
                    </button>
                  </div>

                  {/* Review List */}
                  <div className="space-y-4">
                    {reviews?.map((review: any) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-body text-sm font-bold">{review.profiles?.first_name} {review.profiles?.last_name}</p>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground uppercase font-body">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-body leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                    {!reviews?.length && <p className="text-center py-8 text-sm text-muted-foreground font-body italic">No reviews yet. Be the first!</p>}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-32 pt-16 border-t border-border">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-3xl font-bold tracking-tight">You May Also Like</h2>
              <Link to="/products" className="text-sm font-body font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-8">View All</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
