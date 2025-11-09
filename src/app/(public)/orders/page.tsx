'use client';

import { useOrders } from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { Package, Calendar, MapPin } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Order, OrderItem } from '@/types';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (orders.length === 0) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="You haven't placed any orders. Start shopping now!"
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
        <SectionTitle
          title="Order History"
          description={`You have ${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
        />

        <div className="space-y-6">
          {orders.map((order: Order) => (
            <Card key={order.id} className="glass-card border border-white/20">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Placed on {formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item: OrderItem) => {
                    const product = item.product_details;
                    return (
                      <div key={item.id} className="flex justify-between items-center py-2">
                        <div>
                          <Link
                            href={`/product/${item.product}`}
                            className="font-medium hover:text-primary"
                          >
                            {product?.title || product?.name || `Product #${item.product}`}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(parseFloat(item.price) * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping Address */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Shipping Address</p>
                      <p className="text-muted-foreground">
                        {order.shipping_address}
                        <br />
                        {order.shipping_city}, {order.shipping_postal_code}
                        <br />
                        {order.shipping_country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
