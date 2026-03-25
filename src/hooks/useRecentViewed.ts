import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recent_viewed_products';
const MAX_ITEMS = 10;

export const useRecentViewed = () => {
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentSlugs(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent viewed products', e);
      }
    }
  }, []);

  const addProduct = (slug: string) => {
    setRecentSlugs(prev => {
      const filtered = prev.filter(s => s !== slug);
      const updated = [slug, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { recentSlugs, addProduct };
};
