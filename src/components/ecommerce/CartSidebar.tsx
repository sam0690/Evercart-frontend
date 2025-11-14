/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCartStore } from '@/lib/store';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
//
import { ProductImage } from '@/components/ecommerce/ProductImage';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function CartSidebar() {
  const { isOpen, closeCart, getTotal } = useCartStore();
  const { isAuthenticated } = useAuth();
  const { data: cartItems = [], isLoading, refetch } = useCart();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      closeCart();
      router.push('/login?next=/cart');
    }
  }, [isOpen, isAuthenticated, closeCart, router]);

  // Refetch cart when sidebar opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refetch();
    }
  }, [isOpen, isAuthenticated, refetch]);

  const total = getTotal();
  const itemCount = cartItems.reduce((sum:number, item: any) => sum + item.quantity, 0);

  const handleUpdateQuantity = (id: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty > 0) {
      updateCartItem.mutate({ id, quantity: newQty });
    }
  };

  return (
    <>
      {/* Backdrop with Blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* Glassmorphism Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md glass-panel shadow-ocean-xl flex flex-col border-l border-white/20"
          >
            {/* Header with Glass Effect */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/10 bg-gradient-to-r from-ocean-50/30 to-coral-50/30 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-gradient-ocean-multi">
                Shopping Cart ({itemCount})
              </h2>
                <Button
                variant="ghost"
                size="icon"
                onClick={closeCart}
                className="rounded-full hover:bg-ocean-100/30 transition-all"
              >
                <X className="h-5 w-5 text-ocean-600" />
              </Button>
            </div>

            {/* Cart Items with Enhanced Scrollbar */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-gradient-to-b from-transparent via-white/5 to-white/10">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="h-28 bg-white/40 animate-pulse rounded-2xl shimmer backdrop-blur-sm" 
                    />
                  ))}
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-28 h-28 rounded-full glass-light flex items-center justify-center mb-6 shadow-ocean-md"
                  >
                    <ShoppingBag className="h-14 w-14 text-ocean-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 text-charcoal-900">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-pearl-600 mb-8 max-w-xs">
                    Add some amazing products to get started!
                  </p>
                  <Link href="/" onClick={closeCart}>
                    <Button 
                      variant="ghost"
                      size="lg" 
                      className="rounded-xl shadow-ocean-md hover:shadow-ocean-lg transition-all text-black cursor-pointer"
                    >
                      Browse Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item:any, index:number) => {
                    const product = item.product_details;
                    if (!product) return null;

                    const firstImage = product.images?.[0]?.image;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 glass-light rounded-2xl p-4 hover:shadow-ocean-sm transition-all duration-300 border border-white/20"
                      >
                        {/* Product Image */}
                        <ProductImage
                          src={firstImage || product.image}
                          alt={product.title || product.name || 'Product'}
                          fill
                          className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl glass-light border border-white/20"
                        />

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${product.id}`}
                            onClick={closeCart}
                            className="font-semibold text-charcoal-900 hover:text-ocean-600 line-clamp-2 transition-colors"
                          >
                            {product.title || product.name || 'Product'}
                          </Link>
                          <p className="text-base font-bold mt-1 text-ocean-600">
                            {formatPrice(product.price)}
                          </p>

                          {/* Quantity Controls with Glass */}
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-xl glass-light border-white/20 hover:bg-ocean-100/30"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity, -1)
                              }
                              disabled={updateCartItem.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-bold text-ocean-600">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-xl glass-light border-white/20 hover:bg-ocean-100/30"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity, 1)
                              }
                              disabled={updateCartItem.isPending || item.quantity >= product.inventory}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart.mutate(item.id)}
                              disabled={removeFromCart.isPending}
                              className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Glass */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/10 px-6 py-6 space-y-4 glass-panel backdrop-blur-xl">
                <div className="flex justify-between items-center px-5 py-4 rounded-2xl glass-light border border-white/20">
                  <span className="text-lg font-semibold text-charcoal-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gradient-ocean-multi">
                    {formatPrice(total)}
                  </span>
                </div>
                <Link href="/checkout" onClick={closeCart}>
                  <Button 
                    className="w-full mb-3 h-12 rounded-xl shadow-ocean-md hover:shadow-ocean-lg transition-all bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-500 hover:to-ocean-600 text-black" 
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/cart" onClick={closeCart}>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl glass-light border-white/20 hover:bg-ocean-100/20"
                  >
                    View Cart
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
