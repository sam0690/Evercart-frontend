'use client';

import React, { useState, useEffect } from 'react';
import { useProduct, useAddToCart } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/Loader';
import { ShoppingCart, Minus, Plus, Heart, Share2, Package, Truck, Shield, AlertCircle } from 'lucide-react';
//
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/ecommerce/ProductImage';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProductImage as ProductImageType } from '@/types';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [productId, setProductId] = useState<number | null>(null);
  
  useEffect(() => {
    params.then(resolvedParams => {
      setProductId(parseInt(resolvedParams.id));
    });
  }, [params]);
  
  const { data: product, isLoading, isError, error } = useProduct(productId || 0);
  const addToCart = useAddToCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Loading state - waiting for params to resolve or product to load
  if (!productId || isLoading) {
    return <PageLoader />;
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-charcoal-900">Error Loading Product</h1>
          <p className="text-pearl-600 mb-8 text-lg">
            {error instanceof Error ? error.message : 'Failed to load product details'}
          </p>
          <Link href="/">
            <Button size="lg" className="shadow-ocean-md">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-pearl-100">
            <span className="text-5xl">🔍</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-charcoal-900">Product Not Found</h1>
          <p className="text-pearl-600 mb-8 text-lg">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/">
            <Button size="lg" className="shadow-ocean-md">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const isOutOfStock = product.inventory <= 0;
  const maxQuantity = Math.min(product.inventory, 10);
  const productTitle = product.title || product.name || 'Product';

  const images = product.images?.length > 0
    ? product.images
    : [{ id: 0, image: (product.image as string) || ('' as string), alt_text: productTitle } as ProductImageType];

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    if (isOutOfStock) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart.mutate({
      product: product.id,
      quantity,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <main className="flex-1 bg-ambient-soft">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-pearl-600">
          <Link href="/" className="hover:text-ocean-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/" className="hover:text-ocean-600 transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal-900 font-medium">{productTitle}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square overflow-hidden rounded-3xl glass-light border border-white/20 shadow-elevated"
            >
              <ProductImage
                          src={images[0].image || product.image}
                          alt={product.title || product.name || 'Product'}
                          fill
                          className="h-185 w-186 flex-shrink-0 overflow-hidden rounded-xl glass-light border border-white/20"
                        />
              
              {/* Wishlist & Share Floating Buttons */}
              <div className="absolute top-6 right-6 flex gap-3">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-2xl shadow-elevated backdrop-blur-md bg-white/95 hover:scale-105 transition-all"
                  onClick={() => toast.info('Wishlist feature coming soon!')}
                >
                  <Heart className="h-5 w-5 text-coral-600" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-2xl shadow-elevated backdrop-blur-md bg-white/95 hover:scale-105 transition-all"
                  onClick={() => toast.info('Share feature coming soon!')}
                >
                  <Share2 className="h-5 w-5 text-ocean-600" />
                </Button>
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {images.map((img: ProductImageType, index: number) => (
                  <motion.button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative aspect-square overflow-hidden rounded-2xl border-3 transition-all ${
                      selectedImage === index
                        ? 'border-ocean-500 ring-4 ring-ocean-100 shadow-ocean-md'
                        : 'border-pearl-200 hover:border-ocean-300'
                    }`}
                  >
                    <ProductImage
                      src={img.image}
                      alt={img.alt_text || productTitle}
                      fill
                      sizes="150px"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-charcoal-900 to-ocean-900 bg-clip-text text-black leading-tight">
                {productTitle}
              </h1>
              
              <div className="flex items-center gap-3 mb-6">
                {isOutOfStock ? (
                  <Badge variant="destructive" className="text-sm px-4 py-2 text-black">Out of Stock</Badge>
                ) : product.inventory <= 5 ? (
                  <Badge variant="coral" className="text-sm px-4 py-2 text-black">
                    🔥 Only {product.inventory} left
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-sm px-4 py-2 text-black">✓ In Stock</Badge>
                )}
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <p className="text-5xl font-bold bg-gradient-to-r from-ocean-600 via-ocean-500 to-coral-500 bg-clip-text text-black">
                  {formatPrice(product.price)}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 border border-white/20 shadow-soft"
            >
              <p className="text-pearl-700 leading-relaxed text-lg">
                {product.description}
              </p>
            </motion.div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6 glass-card rounded-2xl p-8 border border-white/20 shadow-soft"
              >
                <div>
                  <label className="text-base font-semibold mb-4 block text-charcoal-900">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-12 w-12 rounded-xl"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="text-3xl font-bold w-16 text-center text-ocean-600">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity}
                      className="h-12 w-12 rounded-xl"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <span className="text-sm text-pearl-600 ml-2 bg-pearl-100 px-4 py-2 rounded-xl">
                      Max: {maxQuantity}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 text-black">
                  <Button
                    size="lg"
                    className="flex-1 h-14 text-base shadow-ocean-md hover:shadow-ocean-lg text-black"
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="mr-2 h-6 w-6 text-black" />
                    Add to Cart
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-2xl p-8 border border-white/20 space-y-6"
            >
              <h3 className="text-xl font-bold text-charcoal-900 mb-6">
                Why Buy From Us
              </h3>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-ocean-100">
                  <Package className="h-6 w-6 text-ocean-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-1">Free Shipping</h4>
                  <p className="text-sm text-pearl-600">On orders over NPR 5,000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-coral-100">
                  <Truck className="h-6 w-6 text-coral-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-1">Fast Delivery</h4>
                  <p className="text-sm text-pearl-600">Delivered in 2-3 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-100">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900 mb-1">Secure Payment</h4>
                  <p className="text-sm text-pearl-600">eSewa, Khalti, Fonepay accepted</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
