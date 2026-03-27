import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { useProducts, useCategories } from '@/hooks/useData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { formatINR } from '@/lib/pricing';
import SEO from '@/components/SEO';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rated', value: 'rating' },
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ categorySlug, search: searchQuery || undefined });
  const category = categories?.find((c) => c.slug === categorySlug);
  const title = searchQuery ? `Results for "${searchQuery}"` : category ? category.name : 'All Products';

  const filtered = useMemo(() => {
    let items = [...(products || [])];
    if (selectedSizes.length > 0) {
      items = items.filter((p) => p.sizes?.some((s: string) => selectedSizes.includes(s)));
    }
    items = items.filter(p => {
      const price = p.price * (1 - (p.discount || 0) / 100);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    switch (sortBy) {
      case 'price-asc': items.sort((a, b) => (a.price * (1 - (a.discount || 0) / 100)) - (b.price * (1 - (b.discount || 0) / 100))); break;
      case 'price-desc': items.sort((a, b) => (b.price * (1 - (b.discount || 0) / 100)) - (a.price * (1 - (a.discount || 0) / 100))); break;
      case 'rating': items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)); break;
    }
    return items;
  }, [products, selectedSizes, priceRange, sortBy]);

  const toggleSize = (size: string) => setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);

  return (
    <Layout>
      <SEO 
        title={title} 
        description={category?.description || `Browse our collection of ${title} at Devanshi Collection. Quality fashion for every woman.`}
      />
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="font-body text-muted-foreground mt-3">{filtered.length} items</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-10">
              <div>
                <h3 className="font-display text-lg font-semibold mb-5 border-b pb-2">Categories</h3>
                <div className="space-y-2.5">
                  <Link to="/products" className={`block text-sm font-body transition-colors ${!categorySlug ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>All Products</Link>
                  {categories?.map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.slug}`} className={`block text-sm font-body transition-colors ${cat.slug === categorySlug ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold mb-5 border-b pb-2">Size</h3>
                <div className="flex flex-wrap gap-2.5">
                  {SIZES.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)} className={`w-10 h-10 flex items-center justify-center text-xs font-body border rounded-full transition-all active:scale-95 ${selectedSizes.includes(size) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary hover:text-primary'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold mb-5 border-b pb-2">Price Range</h3>
                <Slider defaultValue={[0, 10000]} max={10000} step={100} value={priceRange} onValueChange={setPriceRange} className="mt-6" />
                <div className="flex justify-between text-xs font-body text-muted-foreground mt-4">
                  <span>{formatINR(priceRange[0])}</span>
                  <span>{formatINR(priceRange[1])}</span>
                </div>
              </div>

              {(selectedSizes.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                <button onClick={() => { setSelectedSizes([]); setPriceRange([0, 10000]); }} className="w-full py-2.5 text-xs font-body font-semibold tracking-wider uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all rounded-md">
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div className="hidden md:block" />
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9 border-none shadow-none focus:ring-0 font-body text-sm">
                    <SelectValue placeholder="Newest" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value} className="text-sm font-body">{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-secondary rounded-md mb-4" />
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2 mx-auto" />
                    <div className="h-3 bg-secondary rounded w-1/4 mx-auto" />
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {filtered.map((product: any, i: number) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-secondary/30 rounded-xl border border-dashed border-border">
                <p className="font-display text-xl text-muted-foreground">No products found in this range</p>
                <button onClick={() => { setSelectedSizes([]); setPriceRange([0, 10000]); }} className="mt-4 text-sm font-body text-primary underline underline-offset-4">Reset all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
