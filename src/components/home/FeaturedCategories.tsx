import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SAMPLE_CATEGORIES } from '@/lib/constants';

const FeaturedCategories = () => {
  const categories = SAMPLE_CATEGORIES;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-3" style={{ lineHeight: '1.1' }}>
            Shop by Category
          </h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Explore our curated collections designed for every occasion
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className={`group relative block overflow-hidden rounded-lg ${
                  i === 0 ? 'md:row-span-2 aspect-[3/4] md:aspect-auto md:h-full' : 'aspect-[4/5]'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-background">
                    {cat.name}
                  </h3>
                  <span className="font-body text-xs text-background/70 tracking-wider uppercase mt-1 inline-block group-hover:underline underline-offset-4">
                    Explore →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
