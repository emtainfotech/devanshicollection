import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useBanners } from '@/hooks/useData';
import { SAMPLE_BANNERS } from '@/lib/constants';

const HeroBanner = () => {
  const { data: banners } = useBanners('hero');
  const banner = banners?.[0] || SAMPLE_BANNERS.find((b) => b.position === 'hero');

  if (!banner) return null;

  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover object-center" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
      </div>
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-lg">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="inline-block text-xs font-body font-semibold tracking-[0.25em] uppercase text-background/80 mb-4">
            New Season
          </motion.span>
          <h2 className="font-display text-5xl md:text-7xl font-semibold text-background leading-[0.95] mb-4" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {banner.title}
          </h2>
          <p className="font-body text-background/80 text-lg mb-8 max-w-sm">{banner.subtitle}</p>
          <Link to={banner.link || '/products'} className="inline-flex items-center gap-3 bg-background text-foreground px-8 py-3.5 text-sm font-body font-medium tracking-wide hover:bg-background/90 transition-colors active:scale-[0.97] group">
            SHOP NOW
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
