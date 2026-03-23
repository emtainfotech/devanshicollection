import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

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
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const discountedPrice = product.price * (1 - product.discount / 100);
  const wishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: CartItem = {
      id: `${product.id}-${product.sizes[0]}-${product.colors[0]}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.images[0],
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
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary mb-3">
        <img
          src={product.images[0]}
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
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleQuickAdd}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 text-xs font-body font-medium tracking-wider hover:bg-foreground/90 transition-colors active:scale-[0.97] rounded-md"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            QUICK ADD
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-body text-sm font-medium text-foreground truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {product.discount > 0 ? (
            <>
              <span className="font-body text-sm font-semibold text-primary">
                ${discountedPrice.toFixed(2)}
              </span>
              <span className="font-body text-xs text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-body text-sm font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </span>
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
    </Link>
  );
};

export default ProductCard;
