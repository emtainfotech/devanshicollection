import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { useState } from 'react';
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

const isValidImageSrc = (value: string) => {
  const v = String(value || '').trim();
  if (!v) return false;
  if (v.startsWith('data:image/') && v.includes(';base64,')) return true;
  if (/^https?:\/\//i.test(v)) return true;
  if (v.startsWith('/')) return true;
  return false;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const discountedPrice = product.price * (1 - product.discount / 100);
  const wishlisted = isInWishlist(product.id);
  const [activeImage, setActiveImage] = useState(0);
  const images = (product.images || []).filter((img) => isValidImageSrc(img));
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block overflow-hidden">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-secondary"
        onMouseEnter={() => images[1] && setActiveImage(1)}
        onMouseLeave={() => setActiveImage(0)}
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
        />
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors active:scale-95"
            aria-label="Wishlist"
          >
            <Heart className={`h-5 w-5 ${wishlisted ? 'text-red-500 fill-current' : 'text-foreground'}`} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-background text-foreground text-sm font-semibold py-2.5 rounded-md hover:bg-background/90 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="pt-3 text-center">
        <h3 className="font-display text-base text-foreground truncate">{product.name}</h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="font-body font-semibold text-foreground">{formatINR(toINRValue(discountedPrice))}</span>
          {product.discount > 0 && (
            <span className="font-body text-sm text-muted-foreground line-through">
              {formatINR(toINRValue(product.price))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
