import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppChat from './WhatsAppChat';
import ChatbotWidget from './ChatbotWidget';
import { useSiteSettings } from '@/hooks/useData';
import { useEffect } from 'react';
import { updateShippingRules } from '@/lib/pricing';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      updateShippingRules(
        (settings as any).flat_shipping_rate,
        (settings as any).free_shipping_threshold
      );
    }
  }, [settings]);

  return (
    <div className="min-h-screen flex flex-col whatsapp-theme-bg">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
      <WhatsAppChat />
    </div>
  );
};

export default Layout;
