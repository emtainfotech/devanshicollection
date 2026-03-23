import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { SAMPLE_PRODUCTS } from '@/lib/constants';
import { Link } from 'react-router-dom';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  filter?: 'trending' | 'featured' | 'new';
  limit?: number;
}

const ProductGrid = ({ title, subtitle, filter, limit = 4 }: ProductGridProps) => {
  let products = SAMPLE_PRODUCTS;

  if (filter === 'trending') products = products.filter((p) => p.is_trending);
  if (filter === 'featured') products = products.filter((p) => p.is_featured);

  products = products.slice(0, limit);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground" style={{ lineHeight: '1.1' }}>
              {title}
            </h2>
            {subtitle && (
              <p className="font-body text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          <Link
            to="/products"
            className="hidden md:inline-flex text-sm font-body font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            View All
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/products"
            className="text-sm font-body font-medium text-foreground underline underline-offset-4"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
