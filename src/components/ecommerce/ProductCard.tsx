'use client';

import { motion } from 'framer-motion';
//
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useAddToCart } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';
import { toast } from 'sonner';
import { ProductImage } from '@/components/ecommerce/ProductImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // const profuctname = product.title;
  // console.log('Rendering ProductCard for:', profuctname);

  const addToCart = useAddToCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const firstImage = product.images?.[0]?.image;


  const isOutOfStock = product.inventory <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
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
      quantity: 1,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group relative h-full"
    >
      <Link href={`/product/${product.id}`}>
  <div className="h-full overflow-hidden rounded-3xl glass-light border border-white/20 shadow-soft hover:shadow-ocean-lg hover:border-ocean-300/50 transition-all duration-500">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pearl-50/50 to-white/50">
            <ProductImage
                          src={firstImage || product.image}
                          alt={product.title || product.name || 'Product'}
                          fill
                          className="h-100 w-100 flex-shrink-0 overflow-hidden rounded-xl glass-light border border-white/20"
                        />
            
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badges with Glass */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isOutOfStock && (
                <Badge variant="destructive" className="shadow-md glass-card border border-white/20">
                  Out of Stock
                </Badge>
              )}
              {product.inventory > 0 && product.inventory <= 5 && (
                <Badge variant="coral" className="shadow-md glass-card border border-white/20">
                  Only {product.inventory} left
                </Badge>
              )}
            </div>

            {/* Wishlist Button with Glass */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 glass-card shadow-elevated border border-white/30 hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Wishlist feature coming soon!');
              }}
            >
              <Heart className="h-5 w-5 text-coral-600" />
            </Button>
          </div>

          {/* Content with Enhanced Spacing */}
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-lg line-clamp-2 text-charcoal-900 group-hover:text-ocean-600 transition-colors duration-300 leading-tight text-black">
              {product.title}
            </h3>
            
            <p className="text-sm text-pearl-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-gradient-ocean-multi">
                  {formatPrice(product.price)}
                </p>
              </div>
              
                <Button
                size="icon"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCart.isPending}
                className="rounded-2xl shadow-lg shadow-charcoal-900/20 hover:shadow-xl hover:shadow-charcoal-900/30 transition-all duration-300 w-12 h-12 bg-gradient-teal hover:from-ocean-500 hover:to-ocean-600 hover:scale-110 text-black"
                >
                <ShoppingCart className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Enhanced skeleton loader with glassmorphism
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl glass-light border border-white/20 shadow-soft">
      <div className="aspect-square bg-gradient-to-br from-pearl-100/50 to-white/50 shimmer" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-pearl-200/50 shimmer rounded-xl" />
        <div className="h-4 bg-pearl-100/50 shimmer rounded-lg w-3/4" />
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="h-10 w-28 bg-pearl-200/50 shimmer rounded-xl" />
          <div className="h-12 w-12 bg-pearl-200/50 shimmer rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

