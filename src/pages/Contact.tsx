import Layout from "@/components/layout/Layout";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      <div className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 italic text-primary">Contact Us</h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have a question about our collections, orders, or just want to say hello!
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold">Get In Touch</h2>
                <p className="font-body text-muted-foreground leading-relaxed">
                  Have any questions? We're here to help. Contact us through any of the following channels or fill out the form.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">Email Us</p>
                    <p className="font-body text-muted-foreground">support@devanshicollection.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">Call Us</p>
                    <p className="font-body text-muted-foreground">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">Visit Us</p>
                    <p className="font-body text-muted-foreground">Plot 47, Sector 10, Kharghar, Navi Mumbai - 410210</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-8 border border-border shadow-xl">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium">First Name</label>
                    <input type="text" placeholder="John" className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-sm font-medium">Last Name</label>
                    <input type="text" placeholder="Doe" className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-body text-sm font-medium">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="font-body text-sm font-medium">Message</label>
                  <textarea rows={5} placeholder="How can we help you?" className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-display font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
