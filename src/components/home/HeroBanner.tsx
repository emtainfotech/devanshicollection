import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBanners } from '@/hooks/useData';
import { SAMPLE_BANNERS } from '@/lib/constants';

const HeroBanner = () => {
  const { data: banners } = useBanners('hero');
  const heroBanners = useMemo(() => {
    const fromDb = banners?.filter((b) => b.position === 'hero') || [];
    const fromSample = SAMPLE_BANNERS.filter((b) => b.position === 'hero');
    return fromDb.length ? fromDb : fromSample;
  }, [banners]);

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

  const banner = heroBanners[activeIndex];

  if (!banner) return null;

  return (
    <section className="relative h-[62vh] min-h-[470px] md:h-[82vh] overflow-hidden">
      <div className="absolute inset-0">
        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover object-center" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/35 to-foreground/10" />
      </div>
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-lg">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="inline-block text-xs font-body font-semibold tracking-[0.25em] uppercase text-background/80 mb-4">
            New Season
          </motion.span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-semibold text-background leading-[0.95] mb-4" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {banner.title}
          </h2>
          <p className="font-body text-background/80 text-base md:text-lg mb-8 max-w-sm">{banner.subtitle}</p>
          <Link to={banner.link || '/products'} className="inline-flex items-center gap-3 bg-background text-foreground px-6 md:px-8 py-3.5 text-sm font-body font-medium tracking-wide hover:bg-background/90 transition-colors active:scale-[0.97] group">
            SHOP NOW
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {heroBanners.length > 1 && (
        <>
          <button
            onClick={() => setActiveIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center"
            aria-label="Previous hero slide"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev + 1) % heroBanners.length)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center"
            aria-label="Next hero slide"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {heroBanners.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all ${idx === activeIndex ? 'w-6 bg-background' : 'w-2 bg-background/50'}`}
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
