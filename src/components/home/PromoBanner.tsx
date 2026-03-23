import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PromoBanner = () => {
  return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-xl bg-accent"
        >
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-10 md:p-16">
              <span className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-primary mb-3 block">
                Limited Time
              </span>
              <h2
                className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4"
                style={{ lineHeight: '1.05' }}
              >
                Up to 30% Off Ethnic Collection
              </h2>
              <p className="font-body text-muted-foreground mb-8 max-w-sm">
                Handcrafted pieces that celebrate tradition with a modern twist. Available while stocks last.
              </p>
              <Link
                to="/products?category=ethnic-wear"
                className="inline-flex bg-foreground text-background px-8 py-3.5 text-sm font-body font-medium tracking-wide hover:bg-foreground/90 transition-colors active:scale-[0.97]"
              >
                SHOP THE COLLECTION
              </Link>
            </div>
            <div className="aspect-square md:aspect-auto md:h-full">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80"
                alt="Ethnic Collection"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoBanner;
