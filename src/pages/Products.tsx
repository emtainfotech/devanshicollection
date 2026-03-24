import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { useProducts, useCategories } from '@/hooks/useData';
import { SlidersHorizontal } from 'lucide-react';

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ categorySlug });
  const category = categories?.find((c) => c.slug === categorySlug);

  const filtered = useMemo(() => {
    let items = [...(products || [])];
    if (selectedSizes.length > 0) {
      items = items.filter((p) => p.sizes?.some((s: string) => selectedSizes.includes(s)));
    }
    switch (sortBy) {
      case 'price-asc': items.sort((a, b) => Number(a.price) * (1 - (a.discount || 0) / 100) - Number(b.price) * (1 - (b.discount || 0) / 100)); break;
      case 'price-desc': items.sort((a, b) => Number(b.price) * (1 - (b.discount || 0) / 100) - Number(a.price) * (1 - (a.discount || 0) / 100)); break;
      case 'rating': items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)); break;
    }
    return items;
  }, [products, selectedSizes, sortBy]);

  const toggleSize = (size: string) => setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-semibold" style={{ lineHeight: '1.1' }}>
            {category ? category.name : 'All Products'}
          </h1>
          <p className="font-body text-muted-foreground mt-2">{filtered.length} products</p>
        </motion.div>

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 text-sm font-body font-medium active:scale-95 transition-transform">
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {selectedSizes.length > 0 && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{selectedSizes.length}</span>}
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm font-body bg-transparent border-0 text-foreground cursor-pointer focus:outline-none">
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex gap-8">
          {filtersOpen && (
            <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="w-56 flex-shrink-0 hidden md:block">
              <div className="mb-8">
                <h3 className="font-body text-sm font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  <Link to="/products" className={`block text-sm font-body py-1 ${!categorySlug ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>All</Link>
                  {categories?.map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.slug}`} className={`block text-sm font-body py-1 ${cat.slug === categorySlug ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="font-body text-sm font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)} className={`px-3 py-1.5 text-xs font-body border rounded-md transition-colors active:scale-95 ${selectedSizes.includes(size) ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setSelectedSizes([])} className="text-xs font-body text-muted-foreground underline underline-offset-4 hover:text-foreground">Clear All</button>
            </motion.aside>
          )}

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-secondary rounded-lg mb-3" />
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((product: any, i: number) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="font-display text-2xl text-foreground mb-2">No products found</p>
                <p className="font-body text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
