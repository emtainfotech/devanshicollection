import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
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
      let query = supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_active', true);

      if (options?.featured) query = query.eq('is_featured', true);
      if (options?.trending) query = query.eq('is_trending', true);

      if (options?.categorySlug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', options.categorySlug)
          .single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
      }

      if (options?.limit) query = query.limit(options.limit);
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useBanners(position?: string) {
  return useQuery({
    queryKey: ['banners', position],
    queryFn: async () => {
      let query = supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (position) query = query.eq('position', position);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(first_name, last_name)')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}

export function useTestimonials(limit?: number) {
  return useQuery({
    queryKey: ['testimonials', limit],
    queryFn: async () => {
      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) {
        if ((error as any).code === '42P01') return [];
        throw error;
      }
      return data;
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) {
        if ((error as any).code === '42P01') return null;
        throw error;
      }
      return data;
    },
  });
}
