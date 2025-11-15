'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useOrder } from '@/hooks/useApi';
import { PageLoader } from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';

function PaymentSuccessContent() {
  const params = useSearchParams();
  const orderId = Number(params.get('order_id'));
  const { data: order, isLoading, refetch } = useOrder(orderId);
  const clearCart = useCartStore((state) => state.clearCart);
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (!orderId) return;
    // Poll once to fetch updated order data if needed
    const t = setTimeout(() => {
      refetch();
    }, 1500);
    return () => clearTimeout(t);
  }, [orderId, refetch]);

  useEffect(() => {
    const isPaid = order?.status === 'paid' || order?.is_paid || order?.status === 'pending';
    if (!isPaid || hasClearedRef.current) {
      return;
    }

    hasClearedRef.current = true;
    clearCart();
  }, [order, clearCart]);

  if (!orderId || isLoading) return <PageLoader />;

  const isPaid = (order as { is_paid?: boolean; status?: string } | undefined)?.is_paid || order?.status === 'paid';

  return (
    <main className="flex-1 bg-gradient-to-br from-pearl-50 via-white to-ocean-50/20">
      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center glass-light rounded-3xl p-10 border border-white/30 shadow-ocean-md">
          <h1 className="text-4xl font-bold mb-4">
            {isPaid ? 'Payment Successful 🎉' : 'Payment Pending'}
          </h1>
          {isPaid ? (
            <p className="text-pearl-700 mb-8">
              Thank you! Your order has been confirmed. Order ID: <strong>#{orderId}</strong>
            </p>
          ) : (
            <p className="text-pearl-700 mb-8">
              We are processing your payment. If this page does not update, check your orders list shortly.
            </p>
          )}

          <div className="flex justify-center gap-4">
            <Button className="h-12 rounded-xl text-black" asChild>
              <Link href="/orders">View Orders</Link>
            </Button>
            <Button variant="outline" className="h-12 rounded-xl" asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}> 
      <PaymentSuccessContent />
    </Suspense>
  );
}
