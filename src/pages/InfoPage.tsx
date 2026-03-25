import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const PAGE_CONTENT: Record<string, { title: string; content: string[] }> = {
  '/privacy': {
    title: 'Privacy Policy',
    content: [
      'We collect only the information needed to process orders, improve your shopping experience, and provide support. This may include your name, contact details, shipping address, and order history.',
      'Your payment details are handled securely through approved payment partners. We do not store full card details on our systems.',
      'We use your data for order processing, delivery updates, account access, and customer service. We may also send promotional messages if you opt in.',
      'You can request access, correction, or deletion of your personal data by contacting our support team.',
    ],
  },
  '/terms': {
    title: 'Terms & Conditions',
    content: [
      'By using this website, you agree to provide accurate account and order details. We reserve the right to cancel suspicious or fraudulent orders.',
      'Product prices, offers, and availability may change without prior notice. In case of pricing errors, we may cancel or update affected orders.',
      'All content, logos, product images, and design assets on this website are property of Devanshi Collection and may not be reused without permission.',
      'Any misuse of the platform, including unauthorized access attempts or abusive behavior, may result in account suspension.',
    ],
  },
  '/shipping': {
    title: 'Shipping & Returns',
    content: [
      'Orders are processed within 1-2 business days. Delivery timelines depend on your location and courier partner serviceability.',
      'You will receive order and shipping updates by email or phone once your order is confirmed.',
      'If you receive a damaged or incorrect item, contact support within 48 hours of delivery with photos and order details.',
      'Returns and exchanges are accepted only for eligible products in unused condition with original packaging and tags intact.',
    ],
  },
  '/faq': {
    title: 'FAQ',
    content: [
      'How do I track my order? You can track order status from your account orders section once logged in.',
      'Can I cancel my order? Cancellation is allowed before your order is shipped. Contact support quickly for assistance.',
      'Do you offer cash on delivery? Availability depends on location and may be enabled for eligible pin codes.',
      'How can I contact support? Use the Contact page or WhatsApp support option available on the website.',
    ],
  },
  '/size-guide': {
    title: 'Size Guide',
    content: [
      'Choose your size based on body measurements rather than usual size labels for best fitting.',
      'Bust: Measure around the fullest part of your chest. Waist: Measure around your natural waistline. Hip: Measure around the widest part of your hips.',
      'If your measurements fall between two sizes, choose the larger size for comfort or the smaller size for a fitted look.',
      'Need help with sizing? Contact our support team before placing your order and we will help you pick the right fit.',
    ],
  },
};

const InfoPage = () => {
  const { pathname } = useLocation();
  const page = useMemo(
    () =>
      PAGE_CONTENT[pathname] || {
        title: 'Information',
        content: ['The requested page is currently unavailable. Please check back later.'],
      },
    [pathname]
  );

  return (
    <Layout>
      <section className="container mx-auto px-4 py-10 md:py-14 max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-6">{page.title}</h1>
        <div className="space-y-4">
          {page.content.map((paragraph, idx) => (
            <p key={idx} className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default InfoPage;
