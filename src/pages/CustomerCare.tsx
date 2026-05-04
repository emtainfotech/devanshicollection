import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Mail, Phone, Clock } from 'lucide-react';

const FAQS = [
  {
    question: "How do I track my order?",
    answer: "You can track your order by logging into your account and visiting the 'My Orders' section. Once your order is shipped, a tracking number and carrier link will be available there."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 5-day return/refund window from the date of delivery. Items must be unused, unwashed, and have all original tags intact. You can initiate a return from your Account page."
  },
  {
    question: "How long does shipping take?",
    answer: "Orders are typically processed within 1-2 business days. Delivery usually takes 3-7 business days depending on your location."
  },
  {
    question: "Can I cancel my order?",
    answer: "Orders can be cancelled within 2 hours of placement. After that, they may have entered the processing stage. Please contact customer care immediately for urgent cancellations."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within India. We are working on expanding our services to international locations soon!"
  }
];

const CustomerCare = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/customer-queries', {
        ...formData,
        user_id: user?.id || null
      });
      toast.success('Your query has been submitted. Our team will get back to you shortly.');
      setFormData(prev => ({ ...prev, subject: '', message: '' }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Customer Care</h1>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Have a question or concern? We're here to help. Browse our FAQs or send us a message below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* FAQ Section */}
          <div>
            <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" /> Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="font-body text-sm font-semibold text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 p-6 bg-secondary/30 rounded-2xl space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-widest">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm font-body">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Email Support</p>
                    <p className="text-muted-foreground">support@devanshicollection.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm font-body">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Phone / WhatsApp</p>
                    <p className="text-muted-foreground">+91 9691966184</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm font-body">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Working Hours</p>
                    <p className="text-muted-foreground">Mon - Sat: 10:00 AM - 7:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm font-body border-t border-border/50 pt-4">
                  <div className="h-5 w-5 text-primary mt-0.5">📍</div>
                  <div>
                    <p className="font-semibold text-foreground">Registered Office Address</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Devanshi collection<br />
                      Near Union Bank and Gurukrupa Lab,<br />
                      In-front of Madhuram Cosmetics, Ganesh Chowk,<br />
                      Harda, 461331, Madhya Pradesh, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold mb-6">Raise a Concern</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your Name" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Your Phone Number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject / Concern Type</Label>
                <Input 
                  id="subject" 
                  value={formData.subject} 
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Defective Product, Shipping Delay" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea 
                  id="message" 
                  value={formData.message} 
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue in detail..." 
                  className="min-h-[150px]"
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Concern'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerCare;
