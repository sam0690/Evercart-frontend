'use client';

import { useProducts } from '@/hooks/useApi';
import { ProductCard, ProductCardSkeleton } from '@/components/ecommerce/ProductCard';
import type { Product } from '@/types';

export default function ProductsPage() {
  const { data: productsResponse, isLoading } = useProducts();

  const products = Array.isArray(productsResponse)
    ? productsResponse
    : productsResponse?.results || [];

  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-charcoal-900">Products</h1>
          <p className="text-pearl-600 mt-2">Browse our latest products. No login required to view.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 glass-light rounded-3xl border border-white/30 shadow-elevated">
            <p className="text-lg text-pearl-600 mb-6">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
