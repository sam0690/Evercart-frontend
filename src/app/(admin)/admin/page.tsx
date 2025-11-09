/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, type ElementType } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/shared/Loader';
import { useAdminStats, useRecentOrders } from '@/hooks/useAdminApi';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function BarChart({
  h,
  data,
  dataKey,
  series,
  tickLine,
  gridAxis,
}: {
  h: number;
  data: Array<Record<string, any>>;
  dataKey: string;
  series: Array<{ name: string; label: string; color: string }>;
  tickLine?: 'x' | 'y' | 'both' | 'none';
  gridAxis?: 'x' | 'y' | 'both' | 'none';
}) {
  const showX = tickLine === 'x' || tickLine === 'both';
  const showY = tickLine === 'y' || tickLine === 'both';
  const gridX = gridAxis === 'x' || gridAxis === 'both';
  const gridY = gridAxis === 'y' || gridAxis === 'both';

  return (
    <div style={{ width: '100%', height: h }}>
      <ResponsiveContainer>
        <RBarChart data={data}>
          <CartesianGrid vertical={gridY} horizontal={gridX} strokeDasharray="3 3" />
          <XAxis dataKey={dataKey} hide={!showX} />
          <YAxis hide={!showY} />
          <Tooltip />
          <Legend />
          {series.map((s) => (
            <Bar key={s.name} dataKey={s.name} name={s.label} fill={s.color} radius={6} />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color 
}: { 
  title: string; 
  value: string | number; 
  change: string; 
  icon: ElementType;
  color: string;
}) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="glass-light rounded-2xl p-6 border border-white/30 shadow-soft hover:shadow-ocean-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-pearl-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-charcoal-900 mb-2">{value}</h3>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-teal-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-coral-600" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-teal-600' : 'text-coral-600'}`}>
              {change}
            </span>
            <span className="text-sm text-pearl-500">from last month</span>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${
          color === 'ocean' ? 'bg-ocean-100/60 text-ocean-600 glass-light' :
          color === 'coral' ? 'bg-coral-100/60 text-coral-600 glass-light' :
          color === 'teal' ? 'bg-teal-100/60 text-teal-600 glass-light' :
          'bg-pearl-100/60 text-pearl-600 glass-light'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentOrders = [], isLoading: ordersLoading } = useRecentOrders(5);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user || !user.is_admin) {
    return null;
  }

  // Mock data for user registration chart
  const userRegistrationData = [
    { month: 'Jan', registered: 12, loggedIn: 45 },
    { month: 'Feb', registered: 18, loggedIn: 52 },
    { month: 'Mar', registered: 24, loggedIn: 68 },
    { month: 'Apr', registered: 15, loggedIn: 58 },
    { month: 'May', registered: 30, loggedIn: 75 },
    { month: 'Jun', registered: 22, loggedIn: 82 },
  ];

  // Mock data for product orders chart
  const productOrdersData = [
    { product: 'Laptops', orders: 45 },
    { product: 'Phones', orders: 68 },
    { product: 'Tablets', orders: 32 },
    { product: 'Accessories', orders: 58 },
    { product: 'Cameras', orders: 25 },
    { product: 'Audio', orders: 42 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-teal-100/60 text-teal-700 border-teal-200';
      case 'pending':
        return 'bg-coral-100/60 text-coral-700 border-coral-200';
      case 'shipped':
        return 'bg-ocean-100/60 text-ocean-700 border-ocean-200';
      default:
        return 'bg-pearl-100/60 text-pearl-700 border-pearl-200';
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="glass-light rounded-2xl p-8">
          <div className="animate-pulse text-ocean-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <MantineProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-light rounded-2xl p-6 border border-white/30 shadow-ocean-md">
          <h1 className="text-4xl font-bold text-gradient-ocean-coral mb-2">Dashboard Overview</h1>
          <p className="text-pearl-600">Welcome back! Here’s what’s happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            change={stats?.usersChange || '+0%'}
            icon={Users}
            color="ocean"
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            change={stats?.productsChange || '+0%'}
            icon={Package}
            color="teal"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            change={stats?.ordersChange || '+0%'}
            icon={ShoppingCart}
            color="coral"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
            change={stats?.revenueChange || '+0%'}
            icon={DollarSign}
            color="teal"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Registration Chart */}
          <div className="glass-light rounded-2xl p-6 border border-white/30 shadow-soft">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-ocean-600" />
              User Activity
            </h2>
            <p className="text-sm text-pearl-600 mb-6">Monthly user registration and login trends</p>
            <BarChart
              h={300}
              data={userRegistrationData}
              dataKey="month"
              series={[
                { name: 'registered', label: 'New Users', color: 'rgba(0, 136, 255, 0.8)' },
                { name: 'loggedIn', label: 'Active Users', color: 'rgba(0, 168, 150, 0.8)' },
              ]}
              tickLine="y"
              gridAxis="y"
            />
          </div>

          {/* Product Orders Chart */}
          <div className="glass-light rounded-2xl p-6 border border-white/30 shadow-soft">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-coral-600" />
              Product Orders
            </h2>
            <p className="text-sm text-pearl-600 mb-6">Orders by product category</p>
            <BarChart
              h={300}
              data={productOrdersData}
              dataKey="product"
              series={[
                { name: 'orders', label: 'Orders', color: 'rgba(255, 107, 82, 0.8)' },
              ]}
              tickLine="y"
              gridAxis="y"
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-light rounded-2xl p-6 border border-white/30 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-ocean-600" />
                Recent Orders
              </h2>
              <p className="text-sm text-pearl-600 mt-1">Latest customer orders</p>
            </div>
            <Link href="/admin/orders">
              <Button className="rounded-xl shadow-ocean-md bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-500 hover:to-ocean-600 text-white">
                View All Orders
              </Button>
            </Link>
          </div>

          {ordersLoading ? (
            <div className="text-center py-8 text-pearl-600">Loading orders...</div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/30">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-pearl-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order:any) => (
                    <tr key={order.id} className="border-b border-white/20 hover:bg-white/40 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-ocean-600">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-charcoal-900">
                        {order.user_details?.username || `User ${order.user}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-pearl-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-charcoal-900">
                        ${parseFloat(order.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit border`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 glass-light rounded-xl border border-white/20">
              <ShoppingCart className="w-12 h-12 text-pearl-400 mx-auto mb-3" />
              <p className="text-pearl-600">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </MantineProvider>
  );
}
