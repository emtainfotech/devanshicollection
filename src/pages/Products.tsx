import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES } from '@/lib/constants';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const COLORS = ['Black', 'White', 'Burgundy', 'Cream', 'Dusty Rose', 'Camel', 'Olive', 'Sand'];
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
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState('newest');

  const category = categorySlug ? SAMPLE_CATEGORIES.find((c) => c.slug === categorySlug) : null;

  const filtered = useMemo(() => {
    let products = [...SAMPLE_PRODUCTS];

    if (categorySlug) {
      const cat = SAMPLE_CATEGORIES.find((c) => c.slug === categorySlug);
      if (cat) products = products.filter((p) => p.category_id === cat.id);
    }

    if (selectedSizes.length > 0) {
      products = products.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (selectedColors.length > 0) {
      products = products.filter((p) => p.colors.some((c) => selectedColors.includes(c)));
    }

    products = products.filter((p) => {
      const price = p.price * (1 - p.discount / 100);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price * (1 - a.discount / 100) - b.price * (1 - b.discount / 100));
        break;
      case 'price-desc':
        products.sort((a, b) => b.price * (1 - b.discount / 100) - a.price * (1 - a.discount / 100));
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return products;
  }, [categorySlug, selectedSizes, selectedColors, priceRange, sortBy]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));

  const toggleColor = (color: string) =>
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-5xl font-semibold" style={{ lineHeight: '1.1' }}>
            {category ? category.name : 'All Products'}
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-sm font-body font-medium active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {(selectedSizes.length + selectedColors.length > 0) && (
              <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {selectedSizes.length + selectedColors.length}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm font-body bg-transparent border-0 text-foreground cursor-pointer focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {filtersOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-56 flex-shrink-0 hidden md:block"
            >
              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-body text-sm font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {SAMPLE_CATEGORIES.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className={`block text-sm font-body py-1 transition-colors ${
                        cat.slug === categorySlug ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-8">
                <h3 className="font-body text-sm font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 text-xs font-body border rounded-md transition-colors active:scale-95 ${
                        selectedSizes.includes(size)
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h3 className="font-body text-sm font-semibold mb-3">Colors</h3>
                <div className="space-y-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`block text-sm font-body py-1 transition-colors ${
                        selectedColors.includes(color) ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 500]); }}
                className="text-xs font-body text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Clear All Filters
              </button>
            </motion.aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
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
