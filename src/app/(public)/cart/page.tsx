/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
//
import { ProductImage } from '@/components/ecommerce/ProductImage';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const cartQuery = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/cart');
    }
  }, [loading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  const { data: cartItems = [], isLoading } = cartQuery;

  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = parseFloat(item.product_details?.price || '0');
    return total + price * item.quantity;
  }, 0);

  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (id: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty > 0) {
      updateCartItem.mutate({ id, quantity: newQty });
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (cartItems.length === 0) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 text-black">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added any products to your cart yet. Start shopping now!"
            actionLabel="Browse Products"
            actionHref="/"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-ambient-soft">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-ocean-600 via-ocean-500 to-coral-500 bg-clip-text text-black">
            Shopping Cart
          </h1>
          <p className="text-pearl-600 text-lg">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCart.mutate(undefined, {
                  onSuccess: () => {
                    toast.success('Cart cleared successfully');
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onError: (error: any) => {
                    console.error('Failed to clear cart:', error);
                    toast.error(error?.response?.data?.message || error?.message || 'Failed to clear cart');
                  }
                })}
                disabled={clearCart.isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4 mr-2" />
                {clearCart.isPending ? 'Clearing...' : 'Clear Cart'}
              </Button>
              
            </div>

            {cartItems.map((item: any, index: number) => {
              const product = item.product_details;
              if (!product) return null;

              const firstImage = product.images?.[0]?.image;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 p-6 rounded-2xl glass-card border border-white/20 shadow-soft hover:shadow-elevated transition-all duration-300"
                >
                  {/* Product Image */}
                  <Link
                    href={`/product/${product.id}`}
                    className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl group"
                  >
                   <ProductImage
                          src={firstImage || product.image}
                          alt={product.title || product.name || 'Product'}
                          fill
                          className="h-30 w-28 flex-shrink-0 overflow-hidden rounded-xl glass-light border border-white/20"
                        />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${product.id}`}
                      className="font-semibold text-lg hover:text-ocean-600 line-clamp-2 mb-2 transition-colors"
                    >
                      {product.title}
                    </Link>
                    <p className="text-sm text-pearl-600 mb-4">
                      {formatPrice(product.price)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        disabled={updateCartItem.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg text-ocean-600">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        disabled={updateCartItem.isPending || item.quantity >= product.inventory}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {item.quantity >= product.inventory && (
                        <span className="text-xs text-coral-600 ml-2">
                          Max stock reached
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart.mutate(item.id)}
                      disabled={removeFromCart.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <p className="font-bold text-2xl bg-gradient-to-r from-ocean-600 to-coral-500 bg-clip-text text-transparent">
                      {formatPrice(parseFloat(product.price) * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-8 glass-panel border border-white/20 shadow-elevated sticky top-24 space-y-6"
            >
              <h3 className="font-bold text-2xl mb-6 text-charcoal-900">Order Summary</h3>

              <div className="space-y-4 text-base">
                <div className="flex justify-between">
                  <span className="text-pearl-600">Subtotal</span>
                  <span className="font-semibold text-charcoal-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pearl-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-teal-600 font-bold">Free</span>
                    ) : (
                      <span className="text-charcoal-900">{formatPrice(shipping)}</span>
                    )}
                  </span>
                </div>
                {subtotal < 5000 && shipping > 0 && (
                  <div className="bg-ocean-50 rounded-xl p-4 border border-ocean-200">
                    <p className="text-sm text-ocean-700">
                      💡 Add {formatPrice(5000 - subtotal)} more for <strong>free shipping</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-pearl-200 pt-6">
                <div className="flex justify-between text-2xl font-bold mb-6">
                  <span className="text-charcoal-900">Total</span>
                  <span className="bg-gradient-to-r from-ocean-600 to-coral-500 bg-clip-text text-black">
                    {formatPrice(total)}
                  </span>
                </div>

                <Link href="/checkout">
                  <Button size="lg" className="w-full h-14 text-black shadow-ocean-md hover:shadow-ocean-lg mb-2">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <Link href="/" className="block">
                <Button variant="outline" className="w-full h-12">
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="pt-6 border-t-2 border-pearl-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-pearl-600">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <span className="text-teal-600">✓</span>
                  </div>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-pearl-600">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center">
                    <span className="text-ocean-600">✓</span>
                  </div>
                  <span>Free returns within 30 days</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
