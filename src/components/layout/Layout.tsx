import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppChat from './WhatsAppChat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default Layout;
