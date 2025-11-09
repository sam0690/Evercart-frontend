'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdminCreateOrder } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { PageLoader } from '@/components/shared/Loader';
import {
  createInitialManualOrderForm,
  updateManualOrderFormField,
  updateManualOrderItemField,
  addManualOrderItem,
  removeManualOrderItem,
  buildManualOrderPayload,
  ManualOrderFormState,
  ManualOrderItemForm,
} from '@/services/adminOrdersService';
import { enforceAdminAccess } from '@/services/adminAccessService';
import { toast } from 'sonner';

export default function AdminCreateOrderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const createOrderMutation = useAdminCreateOrder();

  const [form, setForm] = useState<ManualOrderFormState>(createInitialManualOrderForm());

  useEffect(() => {
    enforceAdminAccess({ user, authLoading, router });
  }, [user, authLoading, router]);

  if (authLoading || createOrderMutation.isPending) {
    return <PageLoader />;
  }

  if (!user || !user.is_admin) {
    return null;
  }

  const handleFieldChange = (
    field: keyof Omit<ManualOrderFormState, 'items'>,
    value: string | boolean,
  ) => {
    setForm((prev) => updateManualOrderFormField(prev, field, value));
  };

  const handleItemChange = (index: number, field: keyof ManualOrderItemForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      items: updateManualOrderItemField(prev.items, index, field, value),
    }));
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: addManualOrderItem(prev.items),
    }));
  };

  const handleRemoveItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: removeManualOrderItem(prev.items, index),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { payload, error } = buildManualOrderPayload(form);
    if (error || !payload) {
      toast.error(error || 'Invalid order data');
      return;
    }

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Order created successfully');
        router.push('/admin/orders');
      },
      onError: () => toast.error('Failed to create order'),
    });
  };

  return (
    <main className="flex-1 bg-ambient-soft">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <SectionTitle
            title="Create Manual Order"
            description="Fill in the details to create an order on behalf of a customer"
          />
          <Link href="/admin/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>

        <Card className="glass-card border border-white/20">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="create-order-user-id">
                    User ID
                  </label>
                  <Input
                    id="create-order-user-id"
                    value={form.userId}
                    onChange={(e) => handleFieldChange('userId', e.target.value)}
                    placeholder="Enter user ID"
                    type="number"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="create-order-status">
                    Order Status
                  </label>
                  <select
                    id="create-order-status"
                    value={form.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6 md:pt-0">
                  <input
                    id="create-order-paid"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.isPaid}
                    onChange={(e) => handleFieldChange('isPaid', e.target.checked)}
                  />
                  <label htmlFor="create-order-paid" className="text-sm text-muted-foreground">
                    Mark as paid
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="create-order-transaction">
                    Transaction ID (optional)
                  </label>
                  <Input
                    id="create-order-transaction"
                    value={form.transactionId}
                    onChange={(e) => handleFieldChange('transactionId', e.target.value)}
                    placeholder="Reference / transaction ID"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="create-order-address">
                    Shipping Address
                  </label>
                  <Input
                    id="create-order-address"
                    value={form.shippingAddress}
                    onChange={(e) => handleFieldChange('shippingAddress', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="create-order-city">
                    City
                  </label>
                  <Input
                    id="create-order-city"
                    value={form.shippingCity}
                    onChange={(e) => handleFieldChange('shippingCity', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="create-order-postal">
                    Postal Code
                  </label>
                  <Input
                    id="create-order-postal"
                    value={form.shippingPostalCode}
                    onChange={(e) => handleFieldChange('shippingPostalCode', e.target.value)}
                    placeholder="Postal / ZIP code"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="create-order-country">
                    Country
                  </label>
                  <Input
                    id="create-order-country"
                    value={form.shippingCountry}
                    onChange={(e) => handleFieldChange('shippingCountry', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground">Order Items</h4>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                    Add Item
                  </Button>
                </div>
                {form.items.map((item, index) => (
                  <div key={`create-order-item-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor={`create-order-product-${index}`}>
                        Product ID
                      </label>
                      <Input
                        id={`create-order-product-${index}`}
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        placeholder="e.g. 12"
                        type="number"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor={`create-order-quantity-${index}`}>
                        Quantity
                      </label>
                      <Input
                        id={`create-order-quantity-${index}`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        type="number"
                        min="1"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      {form.items.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(createInitialManualOrderForm())}
                  disabled={createOrderMutation.isPending}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={createOrderMutation.isPending} className="text-black">
                  {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
