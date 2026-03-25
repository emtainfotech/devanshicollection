import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBanners } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const PromoBanner = () => {
  const { data: banners, isLoading, error } = useBanners('mid');
  const banner = banners?.[0];

  if (isLoading) return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4">
        <Skeleton className="w-full h-80 rounded-xl" />
      </div>
    </section>
  );

  if (error || !banner) return null;

  return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-xl bg-secondary"
        >
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-10 md:p-16 text-center md:text-left">
              <h2
                className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3"
                style={{ lineHeight: '1.1' }}
              >
                {banner.title}
              </h2>
              <p className="font-body text-muted-foreground mb-6 max-w-sm mx-auto md:mx-0">
                {banner.subtitle}
              </p>
              <Link
                to={banner.link || '/products'}
                className="inline-flex bg-primary text-primary-foreground px-8 py-3 text-sm font-body font-medium tracking-wide hover:bg-primary/90 transition-colors active:scale-[0.97] rounded-full"
              >
                Shop Now
              </Link>
            </div>
            <div className="aspect-video md:aspect-auto md:h-full">
              <img
                src={banner.image_url}
                alt={banner.title}
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
