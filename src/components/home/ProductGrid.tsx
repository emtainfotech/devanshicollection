import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ProductGridProps {
  title: string;
  subtitle?: string;
  filter?: 'trending' | 'featured' | 'new';
  limit?: number;
  isSlider?: boolean;
}

const ProductGrid = ({ title, subtitle, filter, limit = 4, isSlider = false }: ProductGridProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const { data: products, isLoading, error } = useProducts({
    featured: filter === 'featured',
    trending: filter === 'trending',
    limit,
  });

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isLoading) return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-7 md:mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-4xl font-semibold text-foreground" style={{ lineHeight: '1.1' }}>{title}</h2>
            {subtitle && <p className="font-body text-sm md:text-base text-muted-foreground mt-1.5 md:mt-2">{subtitle}</p>}
          </div>
          <Link to="/products" className="hidden md:inline-flex text-sm font-body font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">View All</Link>
        </div>
        <div className={isSlider ? "flex gap-4 overflow-hidden" : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-5"}>
          {[...Array(limit > 4 ? 4 : limit)].map((_, i) => (
            <div key={i} className={isSlider ? "min-w-[280px] flex-shrink-0" : ""}>
              <Skeleton className="w-full aspect-[3/4] mb-2" />
              <Skeleton className="w-3/4 h-5 mb-1" />
              <Skeleton className="w-1/4 h-5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (error) return <div className="text-center py-20 text-red-500">Failed to load products.</div>;

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex items-end justify-between mb-7 md:mb-10">
          <div>
            <h2 className="font-display text-2xl md:text-4xl font-semibold text-foreground" style={{ lineHeight: '1.1' }}>{title}</h2>
            {subtitle && <p className="font-body text-sm md:text-base text-muted-foreground mt-1.5 md:mt-2">{subtitle}</p>}
          </div>
          <Link to="/products" className="hidden md:inline-flex text-sm font-body font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors">View All</Link>
        </motion.div>

        {isSlider ? (
          <div className="relative group">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {products?.map((product: any) => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="absolute -left-12 top-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="absolute -right-12 top-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Carousel>
            
            {/* Visual indicator for slider */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {[...Array(count)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      current === i + 1 ? "w-8 bg-primary" : "w-1.5 bg-primary/20 hover:bg-primary/40"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <p className="text-[10px] font-body font-bold tracking-[0.2em] text-muted-foreground uppercase mt-1">
                Slide to explore collection
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-5">
            {products?.map((product: any, i: number) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link to="/products" className="text-sm font-body font-medium text-foreground underline underline-offset-4">View All Products</Link>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
