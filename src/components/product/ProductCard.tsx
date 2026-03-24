import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatINR, toINRValue } from '@/lib/pricing';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  images: string[];
  sizes: string[];
  colors: string[];
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  is_trending?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const discountedPrice = product.price * (1 - product.discount / 100);
  const wishlisted = isInWishlist(product.id);
  const [quickOpen, setQuickOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const images = (product.images || []).filter((img) => !!img && (img.startsWith('http') || img.includes(',')));
  const primaryImage = images[activeImage] || images[0] || '/placeholder.svg';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: CartItem = {
      id: `${product.id}-${product.sizes[0]}-${product.colors[0]}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: images[0] || '/placeholder.svg',
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    };
    addItem(item);
    toast.success(`${product.name} added to bag`);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const item: CartItem = {
      id: `${product.id}-${product.sizes[0]}-${product.colors[0]}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: images[0] || '/placeholder.svg',
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    };
    addItem(item);
    navigate('/checkout');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block rounded-xl border border-border bg-card p-2.5 md:p-3 hover:shadow-md transition-shadow">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary mb-3"
        onMouseEnter={() => images[1] && setActiveImage(1)}
        onMouseLeave={() => setActiveImage(0)}
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-body font-semibold tracking-wider px-2.5 py-1 rounded-sm">
            −{product.discount}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors active:scale-90"
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-primary text-primary' : 'text-foreground'}`} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickAdd}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 text-[11px] font-body font-medium tracking-wider hover:bg-foreground/90 transition-colors active:scale-[0.97] rounded-md"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              ADD
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickOpen(true); }}
              className="w-full border border-background/60 bg-background/90 text-foreground py-2.5 text-[11px] font-body font-medium tracking-wider hover:bg-background rounded-md"
            >
              QUICK VIEW
            </button>
          </div>
        </div>
      </div>

      <div className="px-0.5">
        <h3 className="font-body text-sm font-medium text-foreground truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {product.discount > 0 ? (
            <>
              <span className="font-body text-base font-semibold text-primary">{formatINR(toINRValue(discountedPrice))}</span>
              <span className="font-body text-xs text-muted-foreground line-through">
                {formatINR(toINRValue(product.price))}
              </span>
            </>
          ) : (
            <span className="font-body text-base font-semibold text-foreground">{formatINR(toINRValue(product.price))}</span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-xs font-body text-muted-foreground">
              {product.rating} ({product.review_count})
            </span>
          </div>
        )}
      </div>

      <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-secondary">
                <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.slice(0, 4).map((img, idx) => (
                    <button key={img + idx} type="button" onClick={() => setActiveImage(idx)} className={`h-14 w-12 rounded border ${activeImage === idx ? 'border-primary' : 'border-border'} overflow-hidden`}>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="font-body text-lg font-semibold">{formatINR(toINRValue(discountedPrice))}</p>
              <p className="font-body text-sm text-muted-foreground mt-2">Sizes: {product.sizes.join(', ')}</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Colors: {product.colors.join(', ')}</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button type="button" onClick={handleQuickAdd} className="bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-body font-medium">Add to Cart</button>
                <button type="button" onClick={handleBuyNow} className="border border-border py-2.5 rounded-md text-sm font-body font-medium hover:bg-accent">Buy Now</button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Link>
  );
};

export default ProductCard;
