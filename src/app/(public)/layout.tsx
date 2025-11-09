import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartSidebar } from '@/components/ecommerce/CartSidebar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Rich Gradient Background - Ocean to Coral */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-ocean-100 via-teal-50 to-coral-100"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="fixed inset-0 -z-10 bg-pattern-dots opacity-20"></div>
      
      {/* Floating Glass Orbs for Depth */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-ocean-300/40 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-40 left-1/4 w-[600px] h-[600px] bg-coral-300/35 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-10 w-[400px] h-[400px] bg-teal-300/30 rounded-full blur-3xl float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-2/3 right-10 w-[350px] h-[350px] bg-ocean-200/25 rounded-full blur-3xl float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <Navbar />
      <CartSidebar />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
    </div>
  );
}
