import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedCategories = () => {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) return (
    <section className="py-10 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-4xl font-semibold text-foreground tracking-tight">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-8 md:gap-8 max-w-5xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="aspect-square w-full rounded-full mx-auto mb-3 shadow-sm" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (error) return <div className="text-center py-20 text-red-500">Failed to load categories.</div>;

  return (
    <section className="py-10 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.5 }} 
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-4xl font-semibold text-foreground tracking-tight">Shop by Category</h2>
        </motion.div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-8 md:gap-8 max-w-5xl mx-auto">
          {categories?.map((cat, i) => (
            <motion.div 
              key={cat.id} 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to={`/products?category=${cat.slug}`} className="group block text-center">
                <div className="relative aspect-square w-full rounded-full mx-auto overflow-hidden shadow-md ring-1 ring-black/5 group-hover:shadow-xl group-hover:ring-primary/20 transition-all duration-500">
                  <img 
                    src={cat.image_url || 'https://via.placeholder.com/200'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    loading="lazy" 
                  />
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
                </div>
                <h3 className="font-body text-[11px] md:text-sm font-semibold text-foreground mt-3 leading-tight group-hover:text-primary transition-colors px-1">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
