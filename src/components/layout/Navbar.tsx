import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useData';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BrandLogo from './BrandLogo';

const Navbar = () => {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();
  const { data: categories } = useCategories();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-body tracking-wider">
        FREE SHIPPING ON ORDERS OVER ₹4,999 · USE CODE <span className="font-semibold">CHIC15</span>
      </div>

      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 -ml-2 active:scale-95 transition-transform" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader><SheetTitle className="font-display text-2xl">Menu</SheetTitle></SheetHeader>
              <nav className="mt-8 space-y-1">
                {categories?.map((cat) => (
                  <Link key={cat.id} to={`/products?category=${cat.slug}`} className="block py-3 px-4 text-sm font-body hover:bg-accent rounded-md transition-colors">
                    {cat.name}
                  </Link>
                ))}
                <div className="border-t border-border my-4" />
                {isAdmin && <Link to="/admin" className="block py-3 px-4 text-sm font-body text-primary font-medium hover:bg-accent rounded-md">Admin Panel</Link>}
              </nav>
            </SheetContent>
          </Sheet>

          <BrandLogo compact className="flex-shrink-0" />

          <div className="hidden lg:flex items-center gap-8">
            {categories?.slice(0, 5).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                {cat.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            <Link to="/products" className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
              All
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2.5 hover:bg-accent rounded-full transition-colors active:scale-95" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link to="/wishlist" className="p-2.5 hover:bg-accent rounded-full transition-colors active:scale-95 relative" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
            </Link>
            <Link to="/account" className="p-2.5 hover:bg-accent rounded-full transition-colors active:scale-95" aria-label="Account">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link to="/cart" className="p-2.5 hover:bg-accent rounded-full transition-colors active:scale-95 relative" aria-label="Cart">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</span>}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search for dresses, tops, accessories..." className="w-full pl-11 pr-4 py-3 bg-secondary border-0 rounded-lg text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
              <button onClick={() => setSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
