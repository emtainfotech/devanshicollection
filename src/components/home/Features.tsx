import { motion } from 'framer-motion';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const features = [
  { 
    icon: Truck, 
    title: 'FREE SHIPPING', 
    desc: 'On all orders above ₹4,999' 
  },
  { 
    icon: RotateCcw, 
    title: '15 DAYS RETURN', 
    desc: 'Easy returns and exchanges' 
  },
  { 
    icon: ShieldCheck, 
    title: 'SECURE PAYMENT', 
    desc: '100% secure payment methods' 
  },
  { 
    icon: Headphones, 
    title: '24/7 SUPPORT', 
    desc: 'Ready to assist you anytime' 
  },
];

const Features = () => {
  return (
    <section className="py-20 border-y border-border bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-6 relative">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                  <f.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-display text-xs font-bold tracking-[0.2em] text-foreground mb-2 uppercase">{f.title}</h3>
              <p className="font-body text-[11px] md:text-xs text-muted-foreground leading-relaxed max-w-[150px] mx-auto uppercase tracking-wider">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
