'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Client-side guard for admin routes
  // Note: Middleware already validates is_admin cookie, so we only need to guard 
  // against undefined user state (loading). Don't redirect based on is_admin flag alone
  // as it can cause race conditions with profile fetching.
  useEffect(() => {
    // Don't enforce admin guard on the login page itself
    if (pathname === '/admin/login') return;
    
    // Only redirect if:
    // 1. Loading is complete AND
    // 2. No user AND
    // 3. No stored user in localStorage (indicating a real logout/invalid session)
    if (!loading && !user) {
      const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
      if (!storedUser) {
        router.push('/admin/login');
      }
    }
  }, [user, loading, router, pathname]);

  // Do not render the admin layout chrome on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-ocean-50 via-pearl-50 to-coral-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
  <div className="h-full glass-panel border-r border-white/30 shadow-ocean-lg backdrop-blur-xl">
          <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="p-6 border-b border-white/20">
              <h1 className="text-2xl font-bold text-gradient-ocean-coral">EverCart Admin</h1>
              <p className="text-sm text-pearl-600 mt-1">Management Portal</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-ocean-md'
                        : 'text-pearl-700 hover:bg-white/40 hover:text-ocean-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-white/20">
              <div className="glass-light rounded-xl p-3 mb-3">
                <p className="text-sm font-medium text-charcoal-900">{user?.username}</p>
                <p className="text-xs text-pearl-600">{user?.email}</p>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start text-coral-600 hover:text-coral-700 hover:bg-coral-100/40 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
  <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/30 shadow-ocean-md">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gradient-ocean-coral">Admin Panel</h1>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl">
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 lg:ml-64 w-full">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
