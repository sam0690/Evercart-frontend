'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminOrders, useAdminUpdateOrder, useAdminDeleteOrder } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { 
  ShoppingCart, 
  Search, 
  Eye,
  Calendar,
  User,
  Package,
  DollarSign
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import {
  filterOrders,
  calculateOrderStats,
  getStatusColor,
  syncOverridesWithOrders,
  updateOrderStatusAction,
  toggleOrderPaidAction,
  deleteOrderAction,
  formatOrderItemsSummary,
  StatusOverrideMap,
  PaidOverrideMap,
} from '@/services/adminOrdersService';
import { enforceAdminAccess } from '@/services/adminAccessService';
import { hasAdminAccess } from '@/lib/utils';

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const hasAccess = hasAdminAccess(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusOverrides, setStatusOverrides] = useState<StatusOverrideMap>({});
  const [paidOverrides, setPaidOverrides] = useState<PaidOverrideMap>({});

  useEffect(() => {
    enforceAdminAccess({ user, authLoading, router });
  }, [user, authLoading, router]);

  const { data: orders = [], isLoading } = useAdminOrders();
  const updateOrderMutation = useAdminUpdateOrder();
  const deleteOrderMutation = useAdminDeleteOrder();

  useEffect(() => {
    setStatusOverrides((prev) => syncOverridesWithOrders(orders, prev, 'status'));
    setPaidOverrides((prev) => syncOverridesWithOrders(orders, prev, 'is_paid'));
  }, [orders]);

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (!hasAccess) {
    return null;
  }

  const filteredOrders = filterOrders(orders, searchQuery, statusFilter);
  const orderStats = calculateOrderStats(orders);

  return (
    <main className="flex-1 bg-ambient-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionTitle 
            title="Order Management" 
            description="View and manage customer orders"
          />
        </div>

        

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className={`${statusFilter === 'all' ? 'border-primary' : ''} glass-card border border-white/20`}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setStatusFilter('all')}>
              <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
              <p className="text-2xl font-bold">{orderStats.total}</p>
            </CardContent>
          </Card>
          <Card className={`${statusFilter === 'pending' ? 'border-primary' : ''} glass-card border border-white/20`}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setStatusFilter('pending')}>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            </CardContent>
          </Card>
          <Card className={`${statusFilter === 'paid' ? 'border-primary' : ''} glass-card border border-white/20`}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setStatusFilter('paid')}>
              <p className="text-sm text-muted-foreground mb-1">Paid</p>
              <p className="text-2xl font-bold text-blue-600">{orderStats.paid}</p>
            </CardContent>
          </Card>
          <Card className={`${statusFilter === 'shipped' ? 'border-primary' : ''} glass-card border border-white/20`}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setStatusFilter('shipped')}>
              <p className="text-sm text-muted-foreground mb-1">Shipped</p>
              <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
            </CardContent>
          </Card>
        </div>

       

        {/* Search Bar */}
        <Card className="mb-6 glass-card border border-white/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by order ID or customer name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {statusFilter !== 'all' && (
                <Button variant="outline" onClick={() => setStatusFilter('all')}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

         <div className="mb-6 flex justify-end">
          <Link href="/admin/orders/new">
            <Button className="text-black">Create Order</Button>
          </Link>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description={
              searchQuery || statusFilter !== 'all'
                ? "No orders match your search or filter criteria."
                : "No orders have been placed yet."
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: Order, index: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow glass-card border border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Order #{order.id}
                          </h3>
                          <Badge 
                            variant="secondary"
                            className={getStatusColor(order.status)}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Badge
                            variant={order.is_paid ? 'secondary' : 'outline'}
                            className={order.is_paid ? 'bg-green-100 text-green-800' : ''}
                          >
                            {order.is_paid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{order.user_details?.username || 'Unknown User'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Shipping Address</p>
                          <p className="font-medium">
                            {order.shipping_address}
                            {order.shipping_city && `, ${order.shipping_city}`}
                            {order.shipping_postal_code && `, ${order.shipping_postal_code}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Payment</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {order.payment_details?.method || 'N/A'}
                            </Badge>
                            {order.payment_details && (
                              <Badge 
                                variant="secondary"
                                className={
                                  order.payment_details.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {order.payment_details.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Items: {formatOrderItemsSummary(order.items)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Status:</span>
                          <select
                            value={statusOverrides[order.id] ?? order.status}
                            onChange={(e) =>
                              updateOrderStatusAction({
                                orderId: order.id,
                                status: e.target.value as Order['status'],
                                orders,
                                statusOverrides,
                                setStatusOverrides,
                                mutation: updateOrderMutation,
                              })
                            }
                            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                            disabled={updateOrderMutation.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                          </select>
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={paidOverrides[order.id] ?? order.is_paid}
                            onChange={() =>
                              toggleOrderPaidAction({
                                order,
                                paidOverrides,
                                setPaidOverrides,
                                mutation: updateOrderMutation,
                              })
                            }
                            disabled={updateOrderMutation.isPending}
                          />
                          Paid
                        </label>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            deleteOrderAction({
                              orderId: order.id,
                              setStatusOverrides,
                              setPaidOverrides,
                              mutation: deleteOrderMutation,
                            })
                          }
                          disabled={deleteOrderMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredOrders.length > 0 && (
          <Card className="mt-6 glass-card border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                  {statusFilter !== 'all' && ` (${statusFilter})`}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    Total Revenue: {formatPrice(
                      filteredOrders.reduce((sum: number, order: Order) => sum + parseFloat(order.total), 0).toString()
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
