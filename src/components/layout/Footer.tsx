import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-secondary text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <BrandLogo withTagline className="mb-6" />
            <p className="text-sm text-muted-foreground leading-relaxed font-body max-w-sm mb-6">
              Sign up for our newsletter to get the latest on sales, new releases and more.
            </p>
            <form className="flex max-w-sm">
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-2.5 bg-background border border-border rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit" className="bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold rounded-r-md hover:bg-primary/90 transition-colors">Subscribe</button>
            </form>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display text-base font-semibold mb-5">Shop</h3>
            <ul className="space-y-3 text-sm font-body text-muted-foreground">
              <li><Link to="/products?category=dresses" className="hover:text-primary transition-colors">Dresses</Link></li>
              <li><Link to="/products?category=tops" className="hover:text-primary transition-colors">Tops</Link></li>
              <li><Link to="/products?category=bottoms" className="hover:text-primary transition-colors">Bottoms</Link></li>
              <li><Link to="/products?category=ethnic-wear" className="hover:text-primary transition-colors">Ethnic Wear</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-display text-base font-semibold mb-5">About</h3>
            <ul className="space-y-3 text-sm font-body text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-display text-base font-semibold mb-5">Customer Service</h3>
            <ul className="space-y-3 text-sm font-body text-muted-foreground">
              <li><Link to="/customer-care" className="hover:text-primary transition-colors font-semibold">Customer Care</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/size-guide" className="hover:text-primary transition-colors">Size Guide</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs font-body text-muted-foreground text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} Devanshi Collection. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
