/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useCategories, useCreateProduct } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLoader } from '@/components/shared/Loader';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { hasAdminAccess } from '@/lib/utils';
import type { ProductCreatePayload } from '@/types';

export default function NewProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const hasAccess = hasAdminAccess(user);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    inventory: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !hasAccess) {
      router.push('/admin/login');
    }
  }, [hasAccess, authLoading, router]);

  if (authLoading) return <PageLoader />;
  if (!hasAccess) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    if (!form.price) e.price = 'Price is required';
    if (!form.inventory) e.inventory = 'Inventory is required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: ProductCreatePayload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        price: form.price,
        inventory: Number(form.inventory),
      };

      if (form.category) {
        payload.category = Number(form.category);
      }

      if (form.imageUrl) {
        payload.images = [
          {
            image: form.imageUrl,
            alt_text: form.title.trim() || undefined,
            is_primary: true,
          },
        ];
      }

      await createProduct.mutateAsync(payload);
      toast.success('Product created');
      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
            </Button>
          </Link>
          <SectionTitle title="Add New Product" description="Create a new product for your store" />
        </div>

        <form onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input id="title" name="title" value={form.title} onChange={onChange} className={errors.title ? 'border-red-500' : ''} />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" name="slug" value={form.slug} onChange={onChange} className={errors.slug ? 'border-red-500' : ''} />
                {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" name="description" value={form.description} onChange={onChange} rows={4} className="w-full px-3 py-2 border rounded-md" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (NPR) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" value={form.price} onChange={onChange} className={errors.price ? 'border-red-500' : ''} />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory *</Label>
                  <Input id="inventory" name="inventory" type="number" value={form.inventory} onChange={onChange} className={errors.inventory ? 'border-red-500' : ''} />
                  {errors.inventory && <p className="text-sm text-red-500">{errors.inventory}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select id="category" name="category" value={form.category} onChange={onChange} className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : ''}`}>
                  <option value="">Select a category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Primary Image URL (optional)</Label>
                <Input id="imageUrl" name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1 text-black">
                  {submitting ? 'Creating...' : 'Create Product'}
                </Button>
                <Link href="/admin/products" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">Cancel</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
