import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return await api.get('/categories');
    },
  });
}

export function useProducts(options?: {
  categorySlug?: string | null;
  featured?: boolean;
  trending?: boolean;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      if (options?.search) {
        const res = await api.get(`/search?q=${encodeURIComponent(options.search)}`);
        let items = [...(res.products || [])];
        if (options?.limit) items = items.slice(0, options.limit);
        return items;
      }
      
      const all = await api.get(options?.categorySlug ? `/products?category=${encodeURIComponent(options.categorySlug)}` : '/products');
      let items = [...(all || [])];
      if (options?.featured) items = items.filter((p: any) => !!p.is_featured);
      if (options?.trending) items = items.filter((p: any) => !!p.is_trending);
      if (options?.limit) items = items.slice(0, options.limit);
      return items;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      return await api.get(`/products/${encodeURIComponent(slug)}`);
    },
    enabled: !!slug,
  });
}

export function useBanners(position?: string) {
  return useQuery({
    queryKey: ['banners', position],
    queryFn: async () => {
      return await api.get(position ? `/banners?position=${encodeURIComponent(position)}` : '/banners');
    },
  });
}

export function useReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      return await api.get(`/reviews?product_id=${encodeURIComponent(productId)}`);
    },
    enabled: !!productId,
  });
}

export function useTestimonials(limit?: number) {
  return useQuery({
    queryKey: ['testimonials', limit],
    queryFn: async () => {
      const all = await api.get('/testimonials');
      return limit ? (all || []).slice(0, limit) : all;
    },
  });
}

export function useWishlistProducts(ids: string[]) {
  return useQuery({
    queryKey: ['products', 'wishlist', ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];
      const all = await api.get('/products');
      return (all || []).filter((p: any) => ids.includes(p.id));
    },
    enabled: ids && ids.length > 0,
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      return await api.get('/site-settings');
    },
  });
}
