/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useCategories, useProduct, useUpdateProduct } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Package } from "lucide-react";
import { hasAdminAccess } from '@/lib/utils';
import type { ProductUpdatePayload } from "@/types";

export default function EditProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const hasAccess = hasAdminAccess(user);

  const { data: categories = [] } = useCategories();
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [inventory, setInventory] = useState("0");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!authLoading && !hasAccess) {
      router.push("/admin/login");
    }
  }, [hasAccess, authLoading, router]);

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setPrice(String(product.price ?? "0"));
      setInventory(String(product.inventory ?? "0"));

      if (typeof product.category === "number") {
        setCategory(String(product.category));
      } else if (typeof product.category === "string" && categories.length > 0) {
        const match = categories.find((c: any) => c.name === product.category);
        if (match) {
          setCategory(String(match.id));
        }
      }
    }
  }, [product, categories]);

  if (authLoading || isLoading) {
    return (
      <main className="flex-1"><div className="container mx-auto px-4 py-8">Loading...</div></main>
    );
  }
  if (!hasAccess) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: ProductUpdatePayload = {};

      if (title.trim()) payload.title = title.trim();
      if (description.trim()) {
        payload.description = description.trim();
      } else if (description === "") {
        payload.description = "";
      }

      if (price !== "") {
        payload.price = price;
      }

      const parsedInventory = Number(inventory);
      if (!Number.isNaN(parsedInventory)) {
        payload.inventory = parsedInventory;
      }

      if (category) {
        payload.category = Number(category);
      }

      await updateProduct.mutateAsync({ id, payload });
      toast.success("Product updated");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/products" className="inline-flex items-center">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Edit Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={4} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input id="inventory" type="number" value={inventory} onChange={(e) => setInventory(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Uncategorized</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <Button type="submit" disabled={updateProduct.isPending} className="text-black">
                  {updateProduct.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/admin/products">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
