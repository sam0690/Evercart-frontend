/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks/useApi';
import { ProductCard, ProductCardSkeleton } from '@/components/ecommerce/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product, ProductFilters } from '@/types';

function HomePageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: productsResponse, isLoading } = useProducts(filters);
  const { data: categories = [] } = useCategories();

  const products = Array.isArray(productsResponse)
    ? productsResponse
    : productsResponse?.results || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryId,
    }));
  };

  const handleSortChange = (ordering: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFilters((prev) => ({ ...prev, ordering: ordering as any }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Sync search query from URL (e.g., when using Navbar search)
  useEffect(() => {
    const q = searchParams.get('search') || '';
    if (q) {
      setSearchQuery(q);
      setFilters((prev) => ({ ...prev, search: q }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const hasActiveFilters = filters.category || filters.search || filters.ordering;

  return (
    <main className="flex-1">
      {/* Hero Section with Glass Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-50/50 via-white/50 to-coral-50/50 py-32">
        {/* Decorative Floating Glass Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-ocean-300/15 rounded-full blur-3xl float"></div>
          <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-coral-300/15 rounded-full blur-3xl float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-teal-200/12 rounded-full blur-3xl float" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-gradient-ocean-multi leading-tight tracking-tight"
            >
              Your Cart. Your Vibe.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-pearl-600 mb-12 leading-relaxed font-light max-w-3xl mx-auto text-balance"
            >
              Experience the art of shopping — premium selections, perfect prices, made for you.
            </motion.p>

            {/* Search Bar with Glass Effect */}
            <motion.form 
              onSubmit={handleSearch} 
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex gap-3 shadow-ocean-lg rounded-2xl overflow-hidden glass-panel border border-white/30 p-2 hover:border-ocean-300/60 transition-all duration-300 hover:shadow-ocean-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ocean-500" />
                  <Input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-pearl-400 text-charcoal-900"
                  />
                </div>
                <Button type="submit" variant="outline" size="lg" className="h-14 px-10 rounded-xl text-black border-gray-600 bg-amber-600 shadow-ocean-md hover:shadow-ocean-lg bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-500 hover:to-ocean-600 transition-all duration-300 hover-lift">
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Quick Stats/Features with Glass Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              <div className="text-center glass-light rounded-2xl p-6 border border-white/30 shadow-soft hover:shadow-ocean-md transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ocean-100/60 text-ocean-600 mb-4 glass-light shadow-ocean-sm">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-charcoal-900 mb-2">Premium Quality</h3>
                <p className="text-sm text-pearl-600">Carefully selected products</p>
              </div>
              <div className="text-center glass-light rounded-2xl p-6 border border-white/30 shadow-soft hover:shadow-coral-md transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral-100/60 text-coral-600 mb-4 glass-light shadow-coral-sm">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-charcoal-900 mb-2">Fast Delivery</h3>
                <p className="text-sm text-pearl-600">Get it within 2-3 days</p>
              </div>
              <div className="text-center glass-light rounded-2xl p-6 border border-white/30 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100/60 text-teal-600 mb-4 glass shadow-soft">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-charcoal-900 mb-2">Secure Payments</h3>
                <p className="text-sm text-pearl-600">100% secure checkout</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Products Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters with Glass */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="glass-panel rounded-3xl shadow-ocean-md border border-white/30 p-6 backdrop-blur-xl hover:shadow-ocean-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2 text-charcoal-900">
                    <Filter className="h-5 w-5 text-ocean-500" />
                    Filters
                  </h3>
                    {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-100/40 rounded-xl transition-all"
                    >
                      <X className="h-3 w-3 mr-1 text-red-600" />
                      Clear
                    </Button>
                    )}
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-pearl-700 mb-3">Categories</p>
                  <Button
                  variant={!filters.category ? 'default' : 'ghost'}
                  className={`w-full justify-start rounded-xl ${!filters.category ? 'text-gradient-ocean-multi leading-tight tracking-tight' : ''}`}
                  onClick={() => handleCategoryFilter(undefined)}
                  >
                  All Categories
                  </Button>
                  {categories.map((category: any) => (
                  <Button
                    key={category.id}
                    variant={filters.category === category.id ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-xl ${filters.category === category.id ? 'text-gradient-ocean-multi leading-tight tracking-tight' : ''}`}
                    onClick={() => handleCategoryFilter(category.id)}
                  >
                    {category.name}
                  </Button>
                  ))}
                </div>
                </div>

                {/* Sort Options with Glass */}
                <div className="glass-panel rounded-3xl shadow-ocean-md border border-white/30 p-6 backdrop-blur-xl hover:shadow-ocean-lg transition-all duration-300">
                <h4 className="font-bold mb-4 text-charcoal-900 flex items-center gap-2">
                  <span className="text-coral-500">⚡</span>
                  Sort By
                </h4>
                <div className="space-y-2">
                  {[
                  { label: 'Latest', value: '-created_at' },
                  { label: 'Price: Low to High', value: 'price' },
                  { label: 'Price: High to Low', value: '-price' },
                  { label: 'Name: A-Z', value: 'name' },
                  ].map((option: { label: string; value: string }) => (
                  <Button
                    key={option.value}
                    variant={filters.ordering === option.value ? 'default' : 'ghost'}
                    className={`w-full justify-start text-sm rounded-xl ${filters.ordering === option.value ? 'text-gradient-ocean-multi leading-tight tracking-tight' : ''}`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </Button>
                  ))}
                </div>
                </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Active Filters with Glass Badges */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="px-4 py-2 glass-light border border-white/30 shadow-soft">
                    Search: {filters.search}
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="px-4 py-2 glass-light border border-white/30 shadow-soft text-black">
                    {categories.find((c: any) => c.id === filters.category)?.name}
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-8">
              <p className="text-sm text-pearl-600 font-medium">
                {isLoading ? (
                  'Loading products...'
                ) : (
                  `Showing ${products.length} ${products.length === 1 ? 'product' : 'products'}`
                )}
              </p>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 glass-light rounded-3xl border border-white/30 shadow-elevated">
                <p className="text-lg text-pearl-600 mb-6">
                  No products found
                </p>
                <Button onClick={clearFilters} className="rounded-xl shadow-ocean-md hover:shadow-ocean-lg transition-all text-black">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="flex-1"><section className="container mx-auto px-4 py-12"><div className="text-center">Loading...</div></section></main>}>
      <HomePageContent />
    </Suspense>
  );
}
