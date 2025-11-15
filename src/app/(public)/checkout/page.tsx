/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, useInitiatePayment, useSubmitOrder } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, CreditCard, MapPin, Wallet, Package } from 'lucide-react';
import { ProductImage } from '@/components/ecommerce/ProductImage';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { PaymentGateway } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import esewaLogo from '../../../../assets/esewa.png';
import khaltiLogo from '../../../../assets/khalti.png';
import fonepayLogo from '../../../../assets/fonepay.png';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { data: cartItems = [], isLoading } = useCart();
  // Cart will be cleared on the payment success page after backend confirms payment
  const initiatePayment = useInitiatePayment();
  const submitOrder = useSubmitOrder();

  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_country: 'Nepal',
    shipping_phone: '',
  });
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('esewa');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/checkout');
    }
  }, [loading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = parseFloat(item.product_details?.price || '0');
    return total + price * item.quantity;
  }, 0);

  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + shipping;
  const paymentGateways = [
    {
      id: 'esewa' as PaymentGateway,
      name: 'eSewa',
      logo: (
        <Image
          src={esewaLogo}
          alt="eSewa"
          height={40}
          width={40}
          className="h-10 w-10 mb-3 object-contain"
        />
      ),
    },
    { id: 'khalti' as PaymentGateway, name: 'Khalti', logo: (
      <Image
        src={khaltiLogo}
        alt="Khalti"
        height={40}
        width={40}
        className="h-10 w-10 mb-3 object-contain"
      />
    ) },
    { id: 'fonepay' as PaymentGateway, name: 'Fonepay', logo: (
      <Image 
        src={fonepayLogo}
        alt = "fonepay"
        height = {40}
        width = {40}
        className ="h-10 w-10 mb-3 object-contain" />
    ) },
  ];


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shipping_address) newErrors.shipping_address = 'Address is required';
    if (!formData.shipping_city) newErrors.shipping_city = 'City is required';
    if (!formData.shipping_postal_code) newErrors.shipping_postal_code = 'Postal code is required';
    if (!formData.shipping_phone) {
      newErrors.shipping_phone = 'Phone number is required';
    } else {
      const digitsOnly = formData.shipping_phone.replace(/[^0-9+]/g, '');
      if (digitsOnly.length < 7) {
        newErrors.shipping_phone = 'Enter a valid phone number';
      }
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (!isAuthenticated) {
        toast.error('Please login to proceed with payment');
        router.push('/login');
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      // Convert cart items to order items payload
      const items = cartItems.map((ci: any) => ({
        productId: ci.product ?? ci.product_id ?? ci.product_details?.id,
        quantity: ci.quantity,
        product_details: ci.product_details,
      }));
      // Create order with is_paid=false
      const orderRes = await submitOrder.mutateAsync({
        items,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal_code: formData.shipping_postal_code,
        shipping_country: formData.shipping_country,
        shipping_phone: formData.shipping_phone,
      });

      // Initiate payment session
      const payInit = await initiatePayment.mutateAsync({
        order_id: orderRes.order_id,
        gateway: selectedGateway,
        return_url: `${window.location.origin}/payment/success?order_id=${orderRes.order_id}`,
        cancel_url: `${window.location.origin}/checkout`,
      });

      if (payInit?.url && payInit?.params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payInit.url;
        Object.entries(payInit.params).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      if (payInit?.url) {
        // Redirect to gateway URL (eSewa/Fonepay)
        window.location.href = payInit.url;
        return;
      }
      if (payInit?.payment_url) {
        window.location.href = payInit.payment_url;
        return;
      }
      if (payInit?.instructions && selectedGateway === 'bank') {
        // For bank transfer, go to success/confirmation page to show instructions
        toast.success('Bank instructions generated.');
        router.push(`/payment/success?order_id=${orderRes.order_id}`);
        return;
      }

      toast.info('Payment initialized. Follow the gateway instructions.');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order. Please try again.');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (cartItems.length === 0) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add some products to your cart before checking out."
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
            Checkout
          </h1>
          <p className="text-pearl-600 text-lg">
            Complete your order securely
          </p>
        </motion.div>

  <form onSubmit={handlePayment}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="rounded-2xl shadow-elevated glass-panel border border-white/20">
                  <CardHeader className="border-b-2 border-pearl-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-ocean-md">
                        <MapPin className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-charcoal-900">Shipping Information</CardTitle>
                        <p className="text-sm text-pearl-600 mt-1">Where should we send your order?</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_address" className="text-base font-semibold text-charcoal-800">
                        Street Address*
                      </Label>
                      <Input
                        id="shipping_address"
                        name="shipping_address"
                        placeholder="123 Main Street, Apartment 4B"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        className={`h-12 ${errors.shipping_address ? 'border-destructive ring-destructive' : ''}`}
                      />
                      {errors.shipping_address && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive font-medium"
                        >
                          {errors.shipping_address}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_phone" className="text-base font-semibold text-charcoal-800">
                        Phone Number*
                      </Label>
                      <Input
                        id="shipping_phone"
                        name="shipping_phone"
                        type="tel"
                        placeholder="+977-9800000000"
                        value={formData.shipping_phone}
                        onChange={handleChange}
                        className={`h-12 ${errors.shipping_phone ? 'border-destructive ring-destructive' : ''}`}
                      />
                      {errors.shipping_phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-destructive font-medium"
                        >
                          {errors.shipping_phone}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="shipping_city" className="text-base font-semibold text-charcoal-800">
                          City*
                        </Label>
                        <Input
                          id="shipping_city"
                          name="shipping_city"
                          placeholder="Kathmandu"
                          value={formData.shipping_city}
                          onChange={handleChange}
                          className={`h-12 ${errors.shipping_city ? 'border-destructive ring-destructive' : ''}`}
                        />
                        {errors.shipping_city && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive font-medium"
                          >
                            {errors.shipping_city}
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipping_postal_code" className="text-base font-semibold text-charcoal-800">
                          Postal Code*
                        </Label>
                        <Input
                          id="shipping_postal_code"
                          name="shipping_postal_code"
                          placeholder="44600"
                          value={formData.shipping_postal_code}
                          onChange={handleChange}
                          className={`h-12 ${errors.shipping_postal_code ? 'border-destructive ring-destructive' : ''}`}
                        />
                        {errors.shipping_postal_code && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive font-medium"
                          >
                            {errors.shipping_postal_code}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_country" className="text-base font-semibold text-charcoal-800">
                        Country
                      </Label>
                      <Input
                        id="shipping_country"
                        name="shipping_country"
                        value={formData.shipping_country}
                        readOnly
                        className="h-12 bg-pearl-50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="rounded-2xl shadow-elevated glass-panel border border-white/20">
                  <CardHeader className="border-b-2 border-pearl-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center shadow-coral-md">
                        <Wallet className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-charcoal-900">Payment Method</CardTitle>
                        <p className="text-sm text-pearl-600 mt-1">Choose your preferred payment gateway</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {paymentGateways.map((gateway, index) => (
                        <motion.button
                          key={gateway.id}
                          type="button"
                          onClick={() => setSelectedGateway(gateway.id)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all duration-300 ${
                            selectedGateway === gateway.id
                              ? 'border-ocean-500 bg-ocean-50 shadow-ocean-md'
                              : 'border-pearl-200 hover:border-ocean-300 bg-white'
                          }`}
                        >
                          <span className="text-4xl mb-3">{gateway.logo}</span>
                          <span className="font-semibold text-lg text-charcoal-900">{gateway.name}</span>
                          {selectedGateway === gateway.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Badge className="mt-3 bg-gradient-to-r from-ocean-500 to-ocean-600 border-none shadow-ocean-sm text-black">
                                ✓ Selected
                              </Badge>
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="rounded-2xl shadow-elevated glass-panel border border-white/20 sticky top-24">
                  <CardHeader className="border-b-2 border-pearl-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <Package className="h-5 w-5 text-black" />
                      </div>
                      <CardTitle className="text-xl text-charcoal-900">Order Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-8">
                    {/* Cart Items */}
                    <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar">
                      {cartItems.map((item: any, index: number) => {
                        const product = item.product_details;
                        if (!product) return null;

                        const firstImage = product.images?.[0]?.image;
                        // image handled by ProductImage with fallbacks

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex gap-3 p-3 bg-pearl-50 rounded-xl border border-pearl-200"
                          >
                            <ProductImage
                              src={firstImage || product.image}
                              alt={product.title || product.name || 'Product'}
                              fill
                              className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
                              sizes="64px"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold line-clamp-2 text-black mb-1">
                                {product.title}
                              </p>
                              <p className="text-xs text-pearl-600">
                                Qty: <span className="font-semibold text-ocean-600">{item.quantity}</span> × {formatPrice(product.price)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="border-t-2 border-pearl-200 pt-6 space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-pearl-600">Subtotal</span>
                        <span className="font-semibold text-charcoal-900">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-pearl-600">Shipping</span>
                        <span className="font-semibold">
                          {shipping === 0 ? (
                            <span className="text-teal-600 font-bold">Free</span>
                          ) : (
                            <span className="text-charcoal-900">{formatPrice(shipping)}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="border-t-2 border-pearl-200 pt-6">
                      <div className="flex justify-between text-2xl font-bold mb-6">
                        <span className="text-charcoal-900">Total</span>
                        <span className="bg-gradient-to-r from-ocean-600 to-coral-500 bg-clip-text text-black">
                          {formatPrice(total)}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-base shadow-ocean-md hover:shadow-ocean-lg mb-4 text-black"
                        disabled={initiatePayment.isPending || submitOrder.isPending}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        {initiatePayment.isPending || submitOrder.isPending ? 'Processing...' : 'Pay & Place Order'}
                      </Button>
                    </div>

                    <Link href="/cart" className="block">
                      <Button variant="outline" className="w-full h-12">
                        ← Back to Cart
                      </Button>
                    </Link>

                    {/* Security Badge */}
                    <div className="pt-4 border-t-2 border-pearl-200">
                      <div className="flex items-center gap-3 text-sm text-pearl-600 bg-teal-50 p-3 rounded-xl border border-teal-200">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-bold">🔒</span>
                        </div>
                        <span className="text-teal-700 font-medium">Secure payment processing</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
