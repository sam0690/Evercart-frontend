import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import type {
  Order,
  OrderItem,
  OrderAdminCreatePayload,
  OrderAdminUpdatePayload,
} from '@/types';

export type StatusOverrideMap = Record<number, Order['status']>;
export type PaidOverrideMap = Record<number, boolean>;

export interface ManualOrderItemForm {
  productId: string;
  quantity: string;
}

export interface ManualOrderFormState {
  userId: string;
  status: Order['status'];
  isPaid: boolean;
  transactionId: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: ManualOrderItemForm[];
}

interface UpdateMutation {
  mutate: (
    variables: { id: number; payload: OrderAdminUpdatePayload },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => void;
  isPending: boolean;
}

interface DeleteMutation {
  mutate: (
    variables: number,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => void;
  isPending: boolean;
}

export function createInitialManualOrderForm(): ManualOrderFormState {
  return {
    userId: '',
    status: 'pending',
    isPaid: false,
    transactionId: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: '',
    items: [{ productId: '', quantity: '1' }],
  };
}

export function updateManualOrderFormField(
  form: ManualOrderFormState,
  field: keyof Omit<ManualOrderFormState, 'items'>,
  value: string | boolean,
): ManualOrderFormState {
  return {
    ...form,
    [field]: value,
  } as ManualOrderFormState;
}

export function updateManualOrderItemField(
  items: ManualOrderItemForm[],
  index: number,
  field: keyof ManualOrderItemForm,
  value: string,
): ManualOrderItemForm[] {
  return items.map((item, itemIndex) =>
    itemIndex === index ? { ...item, [field]: value } : item
  );
}

export function addManualOrderItem(items: ManualOrderItemForm[]): ManualOrderItemForm[] {
  return [...items, { productId: '', quantity: '1' }];
}

export function removeManualOrderItem(items: ManualOrderItemForm[], index: number): ManualOrderItemForm[] {
  if (items.length <= 1) {
    return items;
  }
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function buildManualOrderPayload(
  form: ManualOrderFormState,
): { payload?: OrderAdminCreatePayload; error?: string } {
  const userId = Number(form.userId);
  if (!userId) {
    return { error: 'Enter a valid user ID' };
  }

  const items = form.items
    .map((item) => ({
      product: Number(item.productId),
      quantity: Number(item.quantity),
    }))
    .filter((item) => item.product > 0 && item.quantity > 0);

  if (items.length === 0) {
    return { error: 'Add at least one valid product and quantity' };
  }

  const payload: OrderAdminCreatePayload = {
    user: userId,
    status: form.status,
    is_paid: form.isPaid,
    items_data: items,
  };

  if (form.transactionId.trim()) payload.transaction_id = form.transactionId.trim();
  if (form.shippingAddress.trim()) payload.shipping_address = form.shippingAddress.trim();
  if (form.shippingCity.trim()) payload.shipping_city = form.shippingCity.trim();
  if (form.shippingPostalCode.trim()) payload.shipping_postal_code = form.shippingPostalCode.trim();
  if (form.shippingCountry.trim()) payload.shipping_country = form.shippingCountry.trim();

  return { payload };
}

export function filterOrders(
  orders: Order[],
  searchQuery: string,
  statusFilter: string,
): Order[] {
  const normalizedQuery = searchQuery.toLowerCase();
  return orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.id.toString().includes(searchQuery) ||
      (order.user_details?.username?.toLowerCase() || '').includes(normalizedQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}

export function calculateOrderStats(orders: Order[]) {
  return orders.reduce(
    (acc, order) => {
      acc.total += 1;
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    { total: 0, pending: 0, paid: 0, shipped: 0 } as Record<string, number>,
  );
}

export function getStatusColor(status: Order['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'paid':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function syncOverridesWithOrders<T>(
  orders: Order[],
  overrides: Record<number, T>,
  key: 'status' | 'is_paid',
): Record<number, T> {
  const orderMap = new Map<number, Order>();
  orders.forEach((order) => orderMap.set(order.id, order));

  const nextOverrides: Record<number, T> = { ...overrides };
  let changed = false;

  Object.entries(overrides).forEach(([keyId, value]) => {
    const orderId = Number(keyId);
    const order = orderMap.get(orderId);
    if (!order) {
      delete nextOverrides[orderId];
      changed = true;
      return;
    }

    const orderValue = key === 'status' ? order.status : order.is_paid;
    if (orderValue === value) {
      delete nextOverrides[orderId];
      changed = true;
    }
  });

  return changed ? nextOverrides : overrides;
}

function removeOverride<T>(map: Record<number, T>, orderId: number) {
  const next = { ...map };
  delete next[orderId];
  return next;
}

export function updateOrderStatusAction(options: {
  orderId: number;
  status: Order['status'];
  orders: Order[];
  statusOverrides: StatusOverrideMap;
  setStatusOverrides: Dispatch<SetStateAction<StatusOverrideMap>>;
  mutation: UpdateMutation;
}) {
  const { orderId, status, orders, statusOverrides, setStatusOverrides, mutation } = options;
  const current = statusOverrides[orderId] ?? orders.find((order) => order.id === orderId)?.status;
  if (current === status) {
    return;
  }

  setStatusOverrides((prev) => ({ ...prev, [orderId]: status }));
  mutation.mutate(
    { id: orderId, payload: { status } },
    {
      onSuccess: () => toast.success('Order status updated'),
      onError: () => {
        toast.error('Failed to update order status');
        setStatusOverrides((prev) => removeOverride(prev, orderId));
      },
    },
  );
}

export function toggleOrderPaidAction(options: {
  order: Order;
  paidOverrides: PaidOverrideMap;
  setPaidOverrides: Dispatch<SetStateAction<PaidOverrideMap>>;
  mutation: UpdateMutation;
}) {
  const { order, paidOverrides, setPaidOverrides, mutation } = options;
  const current = paidOverrides[order.id] ?? order.is_paid;
  const nextValue = !current;

  setPaidOverrides((prev) => ({ ...prev, [order.id]: nextValue }));
  mutation.mutate(
    { id: order.id, payload: { is_paid: nextValue } },
    {
      onSuccess: () => toast.success(`Order marked as ${nextValue ? 'paid' : 'unpaid'}`),
      onError: () => {
        toast.error('Failed to update payment status');
        setPaidOverrides((prev) => removeOverride(prev, order.id));
      },
    },
  );
}

export function deleteOrderAction(options: {
  orderId: number;
  setStatusOverrides: Dispatch<SetStateAction<StatusOverrideMap>>;
  setPaidOverrides: Dispatch<SetStateAction<PaidOverrideMap>>;
  mutation: DeleteMutation;
  confirmFn?: (message: string) => boolean;
}) {
  const defaultConfirm = (message: string) =>
    typeof window !== 'undefined' ? window.confirm(message) : true;

  const { orderId, setStatusOverrides, setPaidOverrides, mutation, confirmFn = defaultConfirm } = options;
  if (!confirmFn(`Delete order #${orderId}? This cannot be undone.`)) {
    return;
  }

  mutation.mutate(orderId, {
    onSuccess: () => {
      toast.success('Order deleted');
      setStatusOverrides((prev) => removeOverride(prev, orderId));
      setPaidOverrides((prev) => removeOverride(prev, orderId));
    },
    onError: () => toast.error('Failed to delete order'),
  });
}

export function formatOrderItemsSummary(items: OrderItem[] = []): string {
  if (!items.length) {
    return 'No items';
  }
  return items
    .map((item) => item.product_details?.title || item.product_details?.name || `Product #${item.product_id || item.product}`)
    .join(', ');
}
