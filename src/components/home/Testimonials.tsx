import { Star } from 'lucide-react';
import { useTestimonials } from '@/hooks/useData';

const Testimonials = () => {
  const { data: testimonials } = useTestimonials(6);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <p className="font-body text-xs tracking-wider text-muted-foreground uppercase">What Customers Say</p>
        <h2 className="font-display text-3xl md:text-4xl mt-2">Loved by our community</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {testimonials.map((t: any) => (
          <article key={t.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Number(t.rating || 0) ? 'fill-gold text-gold' : 'text-border'}`}
                />
              ))}
            </div>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">"{t.comment}"</p>
            <p className="mt-4 font-body text-sm font-medium">{t.customer_name}</p>
            {t.city && <p className="font-body text-xs text-muted-foreground">{t.city}</p>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
