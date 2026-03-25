import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBanners } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const HeroBanner = () => {
  const { data: banners, isLoading, error } = useBanners('hero');
  const heroBanners = useMemo(() => banners?.filter((b) => b.position === 'hero') || [], [banners]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroBanners.length]);

  useEffect(() => {
    if (activeIndex >= heroBanners.length) setActiveIndex(0);
  }, [heroBanners.length, activeIndex]);

  if (isLoading) return (
    <section className="relative h-[75vh] min-h-[500px] md:h-[90vh] overflow-hidden">
      <Skeleton className="w-full h-full" />
    </section>
  );

  if (error) return <div className="text-center py-20">Failed to load banners.</div>;

  const banner = heroBanners[activeIndex];

  if (!banner) return null;

  return (
    <section className="relative h-[75vh] min-h-[500px] md:h-[90vh] overflow-hidden bg-background">
      <div className="absolute inset-0">
        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover object-center" loading="eager" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative h-full container mx-auto px-4 flex items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="inline-block text-sm font-body font-semibold tracking-widest uppercase text-background/90 mb-4">
            {banner.subtitle}
          </motion.span>
          <h2 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold text-background leading-tight mb-6" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {banner.title}
          </h2>
          <Link to={banner.link || '/products'} className="inline-flex items-center gap-3 bg-background text-foreground px-8 md:px-10 py-4 text-base font-body font-medium tracking-wide hover:bg-background/90 transition-colors active:scale-[0.97] group rounded-full">
            Shop Now
          </Link>
        </motion.div>
      </div>

      {heroBanners.length > 1 && (
        <>
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/60 hover:bg-background text-foreground flex items-center justify-center transition-colors duration-300"
            aria-label="Previous hero slide"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % heroBanners.length)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/60 hover:bg-background text-foreground flex items-center justify-center transition-colors duration-300"
            aria-label="Next hero slide"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
            {heroBanners.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-8 bg-background' : 'w-2.5 bg-background/50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
