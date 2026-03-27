import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, TrendingUp, Clock, Grid } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories, useSiteSettings } from '@/hooks/useData';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BrandLogo from './BrandLogo';
import { api } from '@/lib/api';

const Navbar = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();
  const { data: categories } = useCategories();
  const { data: settings } = useSiteSettings();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState<{ popular: string[], recent: string[], categories: any[] } | null>(null);

  const announcement = (settings as any)?.announcement_text?.trim() || 'FREE SHIPPING ON ORDERS OVER ₹4,999 · USE CODE CHIC15';

  useEffect(() => {
    if (searchOpen) {
      api.get(`/search?user_id=${user?.id || ''}`).then(setSearchData).catch(console.error);
    }
  }, [searchOpen, user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-body tracking-wider">
        {announcement}
      </div>

      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8 flex-1">
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
            <div className="hidden lg:flex items-center gap-8">
              {categories?.slice(0, 3).map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`} className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                  {cat.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <BrandLogo className="flex-shrink-0 h-12" />
          </div>

          <div className="flex items-center gap-1 flex-1 justify-end">
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
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search for dresses, tops, accessories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-secondary border-0 rounded-lg text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                autoFocus 
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full">
                <X className="h-4 w-4" />
              </button>
            </form>
            
            {searchData && !searchQuery && (
              <div className="mt-4 grid md:grid-cols-3 gap-8 p-4 bg-background border border-border rounded-lg shadow-xl">
                {searchData.recent.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-body font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      <Clock className="h-3 w-3" /> Recent Searches
                    </h4>
                    <div className="space-y-2">
                      {searchData.recent.map((s, i) => (
                        <button key={i} onClick={() => { setSearchQuery(s); navigate(`/products?q=${encodeURIComponent(s)}`); setSearchOpen(false); }} className="block text-sm font-body hover:text-primary transition-colors">{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-body font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    <TrendingUp className="h-3 w-3" /> Popular Searches
                  </h4>
                  <div className="space-y-2">
                    {searchData.popular.map((s, i) => (
                      <button key={i} onClick={() => { setSearchQuery(s); navigate(`/products?q=${encodeURIComponent(s)}`); setSearchOpen(false); }} className="block text-sm font-body hover:text-primary transition-colors">{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-body font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    <Grid className="h-3 w-3" /> Popular Categories
                  </h4>
                  <div className="space-y-2">
                    {searchData.categories.map((c, i) => (
                      <Link key={i} to={`/products?category=${c.slug}`} onClick={() => setSearchOpen(false)} className="block text-sm font-body hover:text-primary transition-colors">{c.name}</Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
