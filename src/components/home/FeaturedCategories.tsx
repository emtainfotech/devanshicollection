import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedCategories = () => {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4" />
              <Skeleton className="h-5 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (error) return <div className="text-center py-20">Failed to load categories.</div>;

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Shop by Category</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
          {categories?.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Link to={`/products?category=${cat.slug}`} className="group text-center block">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300">
                  <img src={cat.image_url || 'https://via.placeholder.com/150'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                </div>
                <h3 className="font-body text-sm md:text-base font-medium text-foreground mt-4 group-hover:text-primary transition-colors">{cat.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
