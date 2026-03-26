import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { api } from '@/lib/api';
import { setShippingRules } from '@/lib/pricing';
import { useEffect } from 'react';
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminBanners from "./pages/admin/Banners";
import AdminOrders from "./pages/admin/Orders";
import AdminTransactions from "./pages/admin/Transactions";
import AdminComplaints from "./pages/admin/Complaints";
import AdminCoupons from "./pages/admin/Coupons";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminSettings from "./pages/admin/Settings";
import AdminChatbotLogs from "./pages/admin/ChatbotLogs";
import AdminBlogs from "./pages/admin/Blogs";
import InfoPage from "./pages/InfoPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    api.get('/shipping-rules').then(rules => {
      setShippingRules(Number(rules.flat_shipping_rate), Number(rules.free_shipping_threshold));
    }).catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment/callback" element={<PaymentCallback />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/banners" element={<AdminBanners />} />
                  <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                  <Route path="/admin/chatbot-logs" element={<AdminChatbotLogs />} />
                  <Route path="/admin/blogs" element={<AdminBlogs />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/transactions" element={<AdminTransactions />} />
                  <Route path="/admin/complaints" element={<AdminComplaints />} />
                  <Route path="/admin/coupons" element={<AdminCoupons />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/privacy" element={<InfoPage />} />
                  <Route path="/terms" element={<InfoPage />} />
                  <Route path="/shipping" element={<InfoPage />} />
                  <Route path="/faq" element={<InfoPage />} />
                  <Route path="/size-guide" element={<InfoPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
