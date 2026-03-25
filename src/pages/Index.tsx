import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ProductGrid from '@/components/home/ProductGrid';
import PromoBanner from '@/components/home/PromoBanner';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <FeaturedCategories />
      <ProductGrid title="Trending Now" subtitle="Styles our community can't stop wearing" filter="trending" limit={4} />
      <PromoBanner />
      <ProductGrid title="New Arrivals" subtitle="Fresh picks, just landed" filter="new" limit={4} />
      <Testimonials />
      <Features />
    </Layout>
  );
};

export default Index;
