'use client';
import { useEffect, useRef } from 'react';
import { useClearCart } from '@/hooks/useApi';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/shared/Loader';
import { useOrder } from '@/hooks/useApi';

function PaymentFailureContent() {
  const params = useSearchParams();
  const orderIdParam = params.get('order_id');
  const orderId = orderIdParam ? Number(orderIdParam) : NaN;
  const hasOrderId = Number.isFinite(orderId) && orderId > 0;

  const { data: order, isLoading, refetch } = useOrder(hasOrderId ? orderId : 0);

   const clearCart = useClearCart();
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
      if (!isPaid || hasClearedRef.current || clearCart.isPending) {
        return;
      }
  
      hasClearedRef.current = true;
      clearCart.mutate();
    }, [order, clearCart]);

  const isPaid = order?.status === 'paid' || order?.is_paid || order?.status === 'pending';

  if (hasOrderId && isLoading) {
    return <PageLoader />;
  }

  return (
    // <main className="flex-1 bg-gradient-to-br from-pearl-50 via-white to-coral-50/30">
    //   <div className="container mx-auto px-4 py-16">
    //     <motion.div
    //       initial={{ opacity: 0, y: 20 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       className="max-w-2xl mx-auto text-center glass-light rounded-3xl p-10 border border-white/30 shadow-coral-md"
    //     >
    //       <h1 className="text-4xl font-bold mb-4 text-destructive">
    //         Payment Failed
    //       </h1>
    //       {hasOrderId ? (
    //         <p className="text-pearl-700 mb-6">
    //           We could not confirm the payment for order <strong>#{orderId}</strong>. The current status is
    //           {' '}<strong>{order?.status ?? 'pending'}</strong>. You can try the payment again or choose a different gateway.
    //         </p>
    //       ) : (
    //         <p className="text-pearl-700 mb-6">
    //           We could not verify your payment details. Please return to checkout and try again.
    //         </p>
    //       )}

    //       <div className="flex justify-center gap-4">
    //         {hasOrderId && (
    //           <Button variant="outline" className="h-12 rounded-xl" asChild>
    //             <Link href={`/orders/${orderId}`}>
    //               View Order Details
    //             </Link>
    //           </Button>
    //         )}
    //         <Button variant="outline" className="h-12 rounded-xl" asChild>
    //           <Link href="/checkout">Return to Checkout</Link>
    //         </Button>
    //         <Button variant="outline" className="h-12 rounded-xl" asChild>
    //           <Link href="/product">Continue Shopping</Link>
    //         </Button>
    //       </div>
    //     </motion.div>
    //   </div>
    // </main>
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

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentFailureContent />
    </Suspense>
  );
}
