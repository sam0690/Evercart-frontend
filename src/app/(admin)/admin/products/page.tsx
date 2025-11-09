'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useProducts, useDeleteProduct } from '@/hooks/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/ecommerce/ProductImage';
import { motion } from 'framer-motion';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const { data: products = [], isLoading } = useProducts({
    search: searchQuery,
  });

  const deleteProduct = useDeleteProduct();

  if (authLoading || (isLoading && !searchQuery)) {
    return <PageLoader />;
  }

  if (!user || !user.is_admin) {
    return null;
  }

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    deleteProduct.mutate(id);
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <SectionTitle 
            title="Product Management" 
            description="Manage your product catalog"
          />
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name or SKU..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              searchQuery
                ? "No products match your search criteria. Try a different search term."
                : "You haven't added any products yet. Start by creating your first product."
            }
            actionLabel="Add Product"
            actionHref="/admin/products/new"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((product: Product, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Product Image */}
                      <ProductImage
                        src={(product.images && product.images[0]?.image) || product.image}
                        alt={product.title}
                        fill
                        className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                      />

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold mb-1 truncate">
                              {product.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {product.inventory > 0 ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                In Stock ({product.inventory})
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </div>

                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-lg">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                            {product.category_details && (
                              <Badge variant="outline">
                                {product.category_details.name}
                              </Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Link href={`/product/${product.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {products.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground">
                    In Stock: {products.filter((p: Product) => p.inventory > 0).length}
                  </span>
                  <span className="text-muted-foreground">
                    Out of Stock: {products.filter((p: Product) => p.inventory === 0).length}
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
