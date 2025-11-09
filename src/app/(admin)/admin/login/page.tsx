"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If already marked admin in localStorage, go straight to dashboard
    try {
      if (localStorage.getItem('admin') === 'true') {
        router.replace('/admin');
      }
    } catch {}
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(
        { username: form.username, password: form.password },
        { adminOnly: true, redirectTo: "/admin" }
      );
      // Note: login() already sets admin flag and redirects to /admin in AuthContext
      // No need to set it again or manually push router here
    } catch {
      // login already showed a toast; ensure UX stays on page
      toast.error("Invalid credentials or not an admin user.");
      try { localStorage.removeItem('admin'); } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-ambient-soft px-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-white/20 shadow-ocean-lg">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-gradient-ocean-coral mb-2"
        >
          Admin Login
        </motion.h1>
        <p className="text-center text-pearl-600 mb-8">
          Enter your admin credentials to access the dashboard.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="admin"
              className="h-12 rounded-xl"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="h-12 rounded-xl"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl shadow-ocean-md hover:shadow-ocean-lg text-black"
            disabled={submitting || loading}
          >
            {submitting || loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="text-center text-sm text-pearl-600 mt-6">
          Not an admin? Use the regular login:
          <Link href="/login" className="ml-1 text-ocean-600 hover:underline">/login</Link>
        </div>
      </div>
    </main>
  );
}
