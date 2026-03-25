import { Star, Quote } from 'lucide-react';
import { useTestimonials } from '@/hooks/useData';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const { data: testimonials } = useTestimonials(6);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-xs font-bold tracking-[0.3em] text-primary uppercase mb-4"
          >
            TESTIMONIALS
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-foreground"
          >
            Loved by our community
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t: any, i: number) => (
            <motion.article 
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative p-8 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-8 h-8 w-8 text-primary/10" />
              <div className="flex items-center gap-0.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Number(t.rating || 0) ? 'fill-primary text-primary' : 'text-border'}`}
                  />
                ))}
              </div>
              <p className="font-body text-base leading-relaxed text-muted-foreground italic mb-8">
                "{t.comment}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {t.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-foreground uppercase tracking-widest">{t.customer_name}</p>
                  {t.city && <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{t.city}</p>}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
