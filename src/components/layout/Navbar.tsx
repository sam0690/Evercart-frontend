'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount, toggleCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const cartItemCount = getItemCount();
  const isAdmin = user?.is_admin || user?.is_staff;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/cart', label: 'Cart' },
    { href: '/orders', label: 'Orders' },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
  };

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    // Navigate to home with search query
    router.push(`/?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  return (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 relative z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold tracking-tight"
            >
              <span className="text-gradient-ocean-multi">
                EverCart
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-5 py-2 group"
              >
                <span className={`text-sm font-semibold transition-colors duration-300 ${
                  pathname === link.href 
                    ? 'text-ocean-600' 
                    : 'text-pearl-700 group-hover:text-ocean-600'
                }`}>
                  {link.label}
                </span>
                {pathname === link.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ocean-600 via-ocean-500 to-coral-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search: Toggle + Animated Input */}
            <div className="hidden md:flex items-center gap-2">
              <AnimatePresence initial={false}>
                {searchOpen && (
                  <motion.form
                    key="navbar-search"
                    onSubmit={onSearchSubmit}
                    initial={{ opacity: 0, x: 20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 280 }}
                    exit={{ opacity: 0, x: 10, width: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden glass-light border border-white/30 rounded-2xl px-3 py-2 flex items-center"
                  >
                    <Search className="h-4 w-4 text-ocean-600 mr-2" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products..."
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setSearchOpen(false);
                      }}
                      className="bg-transparent outline-none text-sm placeholder:text-pearl-500 text-charcoal-900 w-full"
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSearch}
                className="text-pearl-700 hover:text-ocean-600 hover:bg-white/20 backdrop-blur-md transition-all rounded-2xl"
                aria-label="Toggle search"
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            {/* Theme Toggle */}
            {/* <div clas</Button>sName="hidden md:flex">
              <ThemeToggle />
            </div> */}

            {/* Cart Button with Glass Effect */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative text-pearl-700 hover:text-ocean-600 hover:bg-white/20 backdrop-blur-md transition-all rounded-2xl"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-coral-500 to-coral-600 text-[10px] font-bold text-black shadow-coral-md border border-white/20"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/profile">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-pearl-700 hover:text-ocean-600 hover:bg-white/20 backdrop-blur-md transition-all rounded-2xl"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="rounded-xl shadow-coral-sm hover:shadow-coral-md transition-all text-black"
                    >
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="rounded-xl hover:bg-white/20 backdrop-blur-md"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="rounded-xl hover:bg-white/20 backdrop-blur-md"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    className="rounded-xl shadow-ocean-sm hover:shadow-ocean-md transition-all bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-500 hover:to-ocean-600"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-2xl hover:bg-white/20 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="space-y-2 py-6 bg-white/10 backdrop-blur-lg rounded-2xl mb-4 px-4 border border-white/20">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      pathname === link.href 
                        ? 'bg-ocean-100 text-ocean-700' 
                        : 'text-pearl-700 hover:bg-white/20 backdrop-blur-md'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="border-t border-white/20 pt-4 mt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-white/20 backdrop-blur-md">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full rounded-xl">
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-xl hover:bg-white/20 backdrop-blur-md"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full rounded-xl hover:bg-white/20 backdrop-blur-md">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full rounded-xl shadow-ocean-sm">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
