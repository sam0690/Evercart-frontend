'use client';

import { Suspense, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatPrice } from '@/lib/utils';
import { useOrder } from '@/hooks/useApi';
import { Package, ArrowLeft, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'paid':
      return <Badge className="bg-emerald-500 text-white">Paid</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'shipped':
      return <Badge className="bg-ocean-500 text-black">Shipped</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const orderQuery = useOrder(orderId);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const nextPath = Number.isFinite(orderId) ? `/orders/${orderId}` : '/orders';
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [loading, isAuthenticated, router, orderId]);

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  const { data: order, isLoading, isError } = orderQuery;

  if (!Number.isFinite(orderId)) {
    return (
      <main className="flex-1">
        <EmptyState
          icon={Package}
          title="Invalid order number"
          description="Please check the URL and try again."
          actionLabel="Back to orders"
          actionHref="/orders"
        />
      </main>
    );
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !order) {
    return (
      <main className="flex-1">
        <EmptyState
          icon={Package}
          title="Order not found"
          description="We couldn't locate that order."
          actionLabel="Back to orders"
          actionHref="/orders"
        />
      </main>
    );
  }

  const itemCount = order.items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  return (
    <main className="flex-1 bg-ambient-soft">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/orders">
               Back to Orders
            </Link>
          </Button>
          <StatusBadge status={order.status} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border border-white/20">
            <CardHeader>
              <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span>Order #{order.id}</span>
                <span className="text-sm text-muted-foreground">
                  Placed on {formatDate(order.created_at)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" /> Items ({itemCount})
                </h2>
                <div className="space-y-3">
                  {order.items.map((item) => {
                    const productTitle = item.product_details?.title || item.product_details?.name || `Product #${item.product}`;
                    const lineTotal = formatPrice(parseFloat(String(item.price)) * Number(item.quantity));
                    return (
                      <div key={item.id} className="flex justify-between items-start border border-white/10 rounded-xl p-4 bg-white/30 backdrop-blur-sm">
                        <div>
                          <p className="font-medium">{productTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">{lineTotal}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="border-t pt-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Shipping Details
                </h2>
                <div className="mt-3 text-muted-foreground">
                  <p>{order.shipping_address}</p>
                  <p>
                    {order.shipping_city}, {order.shipping_postal_code}
                  </p>
                  <p>{order.shipping_country}</p>
                </div>
              </section>

              <section className="border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Reference</p>
                  <p className="font-medium">{order.transaction_id || 'Awaiting confirmation'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <OrderDetailContent />
    </Suspense>
  );
}
