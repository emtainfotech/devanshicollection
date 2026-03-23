import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h2 className="font-display text-3xl font-semibold mb-4">DEVANSHI COLLECTION</h2>
            <p className="text-sm opacity-70 leading-relaxed font-body max-w-xs">
              Curating timeless elegance for the modern woman. Every piece tells a story of craftsmanship and style.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 border border-background/20 rounded-full hover:bg-background/10 transition-colors active:scale-95">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 border border-background/20 rounded-full hover:bg-background/10 transition-colors active:scale-95">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 border border-background/20 rounded-full hover:bg-background/10 transition-colors active:scale-95">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-5">Shop</h3>
            <ul className="space-y-3 text-sm font-body opacity-70">
              <li><Link to="/products?category=dresses" className="hover:opacity-100 transition-opacity">Dresses</Link></li>
              <li><Link to="/products?category=tops" className="hover:opacity-100 transition-opacity">Tops</Link></li>
              <li><Link to="/products?category=bottoms" className="hover:opacity-100 transition-opacity">Bottoms</Link></li>
              <li><Link to="/products?category=ethnic-wear" className="hover:opacity-100 transition-opacity">Ethnic Wear</Link></li>
              <li><Link to="/products" className="hover:opacity-100 transition-opacity">View All</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-5">Help</h3>
            <ul className="space-y-3 text-sm font-body opacity-70">
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:opacity-100 transition-opacity">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="hover:opacity-100 transition-opacity">FAQ</Link></li>
              <li><Link to="/size-guide" className="hover:opacity-100 transition-opacity">Size Guide</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-5">Company</h3>
            <ul className="space-y-3 text-sm font-body opacity-70">
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">About Us</Link></li>
              <li><Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:opacity-100 transition-opacity">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-xs font-body opacity-50">
          © {new Date().getFullYear()} Aurelia. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
