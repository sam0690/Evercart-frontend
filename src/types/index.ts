// User & Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_customer: boolean;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export interface AdminUserCreatePayload {
  username: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_customer?: boolean;
  is_admin?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export type AdminUserUpdatePayload = Partial<AdminUserCreatePayload>;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Product Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
}

export interface ProductImageInput {
  image: string;
  alt_text?: string;
  is_primary?: boolean;
}

export interface ProductCreatePayload {
  title: string;
  slug: string;
  description?: string;
  price: string | number;
  inventory: number | string;
  category?: number | null;
  images?: ProductImageInput[];
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export interface Product {
  id: number;
  title: string;
  name?: string; // Alias for title
  slug: string;
  description: string;
  price: string;
  inventory: number;
  stock_quantity?: number; // Alias for inventory
  sku?: string; // Optional field
  category: string | number;
  category_details?: Category;
  images: ProductImage[];
  image?: string; // Primary image shortcut
  created_at: string;
  updated_at?: string;
}

export interface ProductFilters {
  category?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  ordering?: 'price' | '-price' | 'name' | '-created_at';
}

// Cart Types
export interface CartItem {
  id: number;
  user: number;
  product: number;
  product_details?: Product;
  quantity: number;
  added_at: string;
}

export interface CartItemCreate {
  product: number;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}

// Order Types
export interface OrderItem {
  id: number;
  product: number;
  product_details?: Product;
  product_id?: number;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  user: number;
  user_details?: User;
  items: OrderItem[];
  total: string;
  status: 'pending' | 'paid' | 'shipped';
  is_paid?: boolean;
  transaction_id?: string;
  created_at: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_phone?: string;
  payment_details?: Payment;
}

export interface OrderCreate {
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone: string;
}

export interface OrderItemInput {
  product: number;
  quantity: number;
}

export interface OrderAdminCreatePayload {
  user: number;
  status?: Order['status'];
  is_paid?: boolean;
  transaction_id?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_phone?: string;
  items_data: OrderItemInput[];
}

export type OrderAdminUpdatePayload = Partial<OrderAdminCreatePayload> & {
  user?: number;
  items_data?: OrderItemInput[];
};

// Payment Types
export type PaymentGateway = 'esewa' | 'khalti' | 'fonepay' | 'bank';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  order: number;
  order_details?: Order;
  amount: string;
  gateway: PaymentGateway;
  method?: PaymentGateway; // Alias for gateway
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentInitiateRequest {
  order_id: number; // Required in new flow
  gateway: PaymentGateway;
  return_url?: string;
  cancel_url?: string;
}

export interface PaymentInitiateResponse {
  payment_id: number;
  payment_url: string;
  transaction_id: string;
}

export interface PaymentVerifyRequest {
  payment_id: number;
  gateway: PaymentGateway;
  // eSewa specific
  oid?: string;
  amt?: string;
  refId?: string;
  // Khalti specific
  token?: string;
  // Fonepay specific
  PRN?: string;
  BID?: string;
  UID?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  detail?: string;
}
