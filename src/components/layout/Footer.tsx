'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'New Arrivals', href: '/products?sort=new' },
      { label: 'Best Sellers', href: '/products?sort=popular' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Track Order', href: '/orders' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
  <footer className="border-t border-white/10 glass-light backdrop-blur-xl">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <h3 className="text-3xl font-bold text-gradient-ocean-multi">
                EverCart
              </h3>
            </Link>
            <p className="mt-5 text-sm text-pearl-600 max-w-md leading-relaxed">
              Your premium destination for quality products. Shop with confidence and experience
              seamless online shopping with style.
            </p>
            
            {/* Contact Info with Glass Effect */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-3 text-sm text-pearl-600">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl glass-light border border-white/20">
                  <Mail className="h-5 w-5 text-ocean-600" />
                </div>
                <span>support@evercart.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-pearl-600">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl glass-light border border-white/20">
                  <Phone className="h-5 w-5 text-coral-600" />
                </div>
                <span>+977 1234567890</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-pearl-600">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-100/30 border border-white/20">
                  <MapPin className="h-5 w-5 text-teal-600" />
                </div>
                <span>Kathmandu, Nepal</span>
              </div>
            </div>

            {/* Social Links with Glass */}
            <div className="mt-8 flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-2xl glass-light border border-white/20 text-pearl-600 hover:glass-light hover:text-ocean-600 transition-all duration-300 hover:scale-110 hover:shadow-ocean-sm"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-2xl glass-light border border-white/20 text-pearl-600 hover:glass-light hover:text-ocean-600 transition-all duration-300 hover:scale-110 hover:shadow-ocean-sm"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-2xl glass-light border border-white/20 text-pearl-600 hover:glass-light hover:text-coral-600 transition-all duration-300 hover:scale-110 hover:shadow-coral-sm"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-charcoal-900">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pearl-600 hover:text-ocean-600 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-charcoal-900">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pearl-600 hover:text-ocean-600 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-charcoal-900">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pearl-600 hover:text-ocean-600 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-pearl-600">
              © {currentYear} EverCart. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-pearl-600 hover:text-ocean-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
