import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const PAGE_CONTENT: Record<string, { title: string; content: string[] }> = {
  '/privacy': {
    title: 'Privacy Policy',
    content: [
      'At Devanshi Collection, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.',
      '1. Information Collection: We collect personal information that you provide to us, such as your name, shipping address, billing address, email address, and phone number. This information is necessary for processing your orders and providing customer support.',
      '2. Payment Processing: Your payment information (such as credit/debit card details) is processed securely through our authorized payment gateway partner, PhonePe. We do not store your full card details or sensitive payment information on our servers.',
      '3. Use of Information: We use your personal data to process and ship your orders, communicate with you about your account and transactions, send you promotional offers (if you have opted in), and improve our website and services.',
      '4. Data Sharing: We may share your information with third-party service providers who assist us in operating our website, conducting our business, or servicing you, such as shipping carriers and payment processors. We do not sell or rent your personal information to third parties.',
      '5. Cookies: We use cookies to enhance your browsing experience, analyze website traffic, and remember your preferences. You can choose to disable cookies through your browser settings, but this may affect certain features of the website.',
      '6. Security: We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.',
      '7. Your Rights: You have the right to access, update, or delete your personal information. If you wish to exercise any of these rights, please contact our customer support team.',
      '8. Policy Updates: We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.',
    ],
  },
  '/terms': {
    title: 'Terms & Conditions',
    content: [
      'Welcome to Devanshi Collection. By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully.',
      '1. General Terms: You must be at least 18 years old or have parental consent to use this website. By placing an order, you represent that you are providing accurate and complete information.',
      '2. Product Information: We strive to provide accurate product descriptions and pricing. However, we do not warrant that all information is error-free. We reserve the right to correct any errors and cancel orders if necessary.',
      '3. Orders and Payment: All orders are subject to acceptance and availability. Payment must be made in full at the time of purchase through our secure payment gateway.',
      '4. Intellectual Property: All content on this website, including text, graphics, logos, images, and software, is the property of Devanshi Collection and is protected by intellectual property laws.',
      '5. User Conduct: You agree not to use our website for any unlawful purpose, transmit any harmful code, or interfere with the website\'s operation.',
      '6. Limitation of Liability: Devanshi Collection shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the website or products purchased.',
      '7. Governing Law: These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Harda, Madhya Pradesh.',
      '8. Modifications: We reserve the right to modify these Terms & Conditions at any time. Your continued use of the website constitutes acceptance of the updated terms.',
    ],
  },
  '/shipping': {
    title: 'Shipping & Returns',
    content: [
      'Shipping Policy:',
      '- Processing Time: Orders are typically processed within 1-2 business days after payment confirmation.',
      '- Delivery Time: Standard delivery usually takes 3-7 business days across India, depending on your location.',
      '- Shipping Charges: Shipping charges are calculated at checkout based on the weight and destination of your order.',
      '- Tracking: Once your order is shipped, you will receive a tracking number via email/SMS to monitor your delivery status.',
      '',
      'Returns & Refund Policy:',
      '- Return Window: We offer a 5-day return policy for eligible products from the date of delivery.',
      '- Eligibility: To be eligible for a return, the item must be unused, unwashed, and in its original packaging with all tags intact.',
      '- Return Process: To initiate a return, please log in to your account, go to "My Orders", and click on the "Return" button for the eligible item. Alternatively, you can contact our support team at support@devanshicollection.com with your Order ID.',
      '- Inspection: Once your return is received at our warehouse, it undergoes a quality check which typically takes 24-48 hours.',
      '- Refund Approval: If the product passes inspection, your refund will be approved and initiated immediately.',
      '- Refund Timelines: For prepaid orders (Credit/Debit Cards, UPI, Net Banking), the refund will be credited back to the original payment method within 7-10 business days, depending on your bank\'s processing time.',
      '- Refund for COD: For Cash on Delivery orders, we will request your bank account details or UPI ID to process the refund via bank transfer within 7-10 business days.',
      '- Non-Refundable Charges: Please note that original shipping charges and COD convenience fees are non-refundable.',
      '- Partial Refunds: In cases where only part of an order is returned, the refund will be calculated proportionally based on the items returned.',
      '- Damaged Items: If you receive a damaged or incorrect product, please notify us within 48 hours of delivery with supporting photos. We will provide a full refund or a free replacement in such cases.',
    ],
  },
  '/faq': {
    title: 'FAQ',
    content: [
      '1. How do I track my order? You can track your order by logging into your account and visiting the "My Orders" section. You will also receive tracking updates via email/SMS.',
      '2. What payment methods do you accept? We accept all major credit/debit cards, UPI, and net banking through our secure payment partner, PhonePe.',
      '3. Can I cancel my order? You can cancel your order within 2 hours of placement, provided it has not been shipped. Please contact customer support immediately for cancellations.',
      '4. How do I initiate a return? To initiate a return, go to your account orders section or contact our customer care team with your order details.',
      '5. What is the expected delivery time? Delivery usually takes 3-7 business days depending on your location in India.',
      '6. Do you offer Cash on Delivery (COD)? Yes, COD is available for most pin codes across India. You can check eligibility during checkout.',
      '7. How can I reach customer support? You can email us at support@devanshicollection.com or message us on WhatsApp using the link on our website.',
    ],
  },
  '/size-guide': {
    title: 'Size Guide',
    content: [
      'Finding the perfect fit is essential for your comfort and style. Please use our size guide to help you choose the right size.',
      '1. Measuring Tips: Use a flexible measuring tape and keep it level. Measure over your undergarments for the most accurate results.',
      '2. Bust: Measure around the fullest part of your bust, keeping the tape straight across your back.',
      '3. Waist: Measure around your natural waistline, which is the narrowest part of your torso.',
      '4. Hips: Measure around the fullest part of your hips, approximately 8 inches below your waist.',
      '5. Size Chart: Please refer to the specific size chart provided on each product page as measurements may vary slightly between styles.',
      '6. Between Sizes: If your measurements fall between two sizes, we recommend choosing the larger size for a more comfortable fit.',
      '7. Assistance: If you have any questions about sizing, please feel free to contact our customer support team for personalized advice.',
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
