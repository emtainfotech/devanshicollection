import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRecentViewed } from '@/hooks/useRecentViewed';
import ProductCard from '@/components/product/ProductCard';

const RecentViewed = () => {
  const { recentSlugs } = useRecentViewed();

  const { data: products, isLoading } = useQuery({
    queryKey: ['recent-products', recentSlugs],
    queryFn: async () => {
      if (recentSlugs.length === 0) return [];
      // Ideally we'd have a batch endpoint, but let's fetch all products and filter for now
      // Or fetch individually. Since it's only 10 items max, let's fetch all active products
      const all = await api.get('/products');
      return all.filter((p: any) => recentSlugs.includes(p.slug))
                .sort((a: any, b: any) => recentSlugs.indexOf(a.slug) - recentSlugs.indexOf(b.slug));
    },
    enabled: recentSlugs.length > 0
  });

  if (recentSlugs.length === 0 || (!isLoading && products?.length === 0)) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Recently Viewed</h2>
            <p className="font-body text-muted-foreground mt-2 italic">Pick up where you left off</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse aspect-[3/4] bg-secondary rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentViewed;
