'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePayments } from '@/hooks/useApi';
import type { Payment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, RefreshCcw } from 'lucide-react';
import { hasAdminAccess } from '@/lib/utils';

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { data: payments = [], isLoading, refetch, isFetching } = usePayments();
  const hasAccess = hasAdminAccess(user);

  useEffect(() => {
    if (!loading && !hasAccess) {
      router.push('/admin/login');
    }
  }, [hasAccess, loading, router]);

  if (loading) return null;
  if (!hasAccess) return null;

  const statusStyle = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-teal-100/60 text-teal-700 border-teal-200';
      case 'pending':
        return 'bg-coral-100/60 text-coral-700 border-coral-200';
      case 'failed':
      case 'cancelled':
        return 'bg-pearl-100/60 text-pearl-700 border-pearl-200';
      default:
        return 'bg-pearl-100/60 text-pearl-700 border-pearl-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between glass-light rounded-2xl p-6 border border-white/30 shadow-ocean-md">
        <div>
          <h1 className="text-3xl font-bold text-gradient-ocean-coral flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-ocean-600" /> Payments
          </h1>
          <p className="text-pearl-600">Track transactions across all gateways.</p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-500 hover:to-ocean-600 text-white"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="glass-light rounded-2xl p-6 border border-white/30 shadow-soft">
        {isLoading ? (
          <div className="text-center py-8 text-pearl-600">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 glass-light rounded-xl border border-white/20">
            <CreditCard className="w-12 h-12 text-pearl-400 mx-auto mb-3" />
            <p className="text-pearl-600">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: Payment) => (
                  <tr key={p.id} className="border-b border-white/20 hover:bg-white/40 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-ocean-600">#{p.id}</td>
                    <td className="py-3 px-4 text-sm">
                      {p.order ? (
                        <Link href={`/admin/orders/${p.order}`}>Order #{p.order}</Link>
                      ) : (
                        <span className="text-pearl-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-charcoal-900">
                      ${parseFloat(p.amount || '0').toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize text-charcoal-900">{p.method || p.gateway || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusStyle(p.status)} border capitalize`}>{p.status || 'unknown'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-pearl-600">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
