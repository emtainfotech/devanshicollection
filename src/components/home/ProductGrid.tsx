import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  filter?: 'trending' | 'featured' | 'new';
  limit?: number;
}

const ProductGrid = ({ title, subtitle, filter, limit = 4 }: ProductGridProps) => {
  const { data: products, isLoading, error } = useProducts({
    featured: filter === 'featured',
    trending: filter === 'trending',
    limit,
  });

  if (isLoading) return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-7 md:mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-4xl font-semibold text-foreground" style={{ lineHeight: '1.1' }}>{title}</h2>
            {subtitle && <p className="font-body text-sm md:text-base text-muted-foreground mt-1.5 md:mt-2">{subtitle}</p>}
          </div>
          <Link to="/products" className="hidden md:inline-flex text-sm font-body font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-5">
          {[...Array(limit)].map((_, i) => (
            <div key={i}>
              <Skeleton className="w-full aspect-[3/4] mb-2" />
              <Skeleton className="w-3/4 h-5 mb-1" />
              <Skeleton className="w-1/4 h-5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (error) return <div className="text-center py-20">Failed to load products.</div>;

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex items-end justify-between mb-7 md:mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-4xl font-semibold text-foreground" style={{ lineHeight: '1.1' }}>{title}</h2>
            {subtitle && <p className="font-body text-sm md:text-base text-muted-foreground mt-1.5 md:mt-2">{subtitle}</p>}
          </div>
          <Link to="/products" className="hidden md:inline-flex text-sm font-body font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">View All</Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-5">
          {products?.map((product: any, i: number) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link to="/products" className="text-sm font-body font-medium text-foreground underline underline-offset-4">View All Products</Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
