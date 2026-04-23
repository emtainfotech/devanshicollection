import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ProductGrid from '@/components/home/ProductGrid';
import PromoBanner from '@/components/home/PromoBanner';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import RecentViewed from '@/components/product/RecentViewed';
import SEO from '@/components/SEO';

const Index = () => {
  return (
    <Layout>
      <SEO 
        title="Premium Ethnic and Modern Wear" 
        description="Discover the latest collection of premium ethnic and modern wear for women at Devanshi Collection. Shop dresses, tops, and more with free shipping."
      />
      <HeroBanner />
      <ProductGrid title="Trending Now" subtitle="Styles our community can't stop wearing" filter="trending" limit={20} isSlider={true} />
      <FeaturedCategories />
      <ProductGrid title="New Arrivals" subtitle="Fresh picks, just landed" filter="new" limit={20} isSlider={true} />
      <PromoBanner />
      <RecentViewed />
      <Testimonials />
      <Features />
    </Layout>
  );
};

export default Index;
