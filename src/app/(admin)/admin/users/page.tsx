'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { 
  Users, 
  Search, 
  Shield,
  ShoppingBag,
  Calendar,
  Mail
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

// Mock user data - In production, this would come from an API
interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_customer: boolean;
  is_admin: boolean;
  is_staff: boolean;
  date_joined: string;
  order_count?: number;
  total_spent?: number;
}

const mockUsers: UserData[] = [
  {
    id: 1,
    username: 'sam_0690',
    email: 'idksam@gmail.com',
    first_name: 'Sam',
    last_name: '',
    is_customer: false,
    is_admin: true,
    is_staff: true,
    date_joined: '2024-01-01T00:00:00Z',
    order_count: 0,
    total_spent: 0,
  },
];

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  // In production, this would be replaced with actual API call
  const users = mockUsers;
  const isLoading = false;

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (!user || !user.is_admin) {
    return null;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = searchQuery === '' || 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesRole = true;
    if (roleFilter === 'admin') {
      matchesRole = u.is_admin;
    } else if (roleFilter === 'customer') {
      matchesRole = u.is_customer && !u.is_admin;
    } else if (roleFilter === 'staff') {
      matchesRole = u.is_staff && !u.is_admin;
    }
    
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    admin: users.filter((u) => u.is_admin).length,
    customer: users.filter((u) => u.is_customer && !u.is_admin).length,
    staff: users.filter((u) => u.is_staff && !u.is_admin).length,
  };

  const getUserRoleBadge = (u: UserData) => {
    if (u.is_admin) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    if (u.is_staff) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Staff
        </Badge>
      );
    }
    if (u.is_customer) {
      return (
        <Badge variant="outline">
          Customer
        </Badge>
      );
    }
    return <Badge variant="outline">User</Badge>;
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionTitle 
            title="User Management" 
            description="View and manage user accounts"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className={roleFilter === 'all' ? 'border-primary' : ''}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setRoleFilter('all')}>
              <p className="text-sm text-muted-foreground mb-1">Total Users</p>
              <p className="text-2xl font-bold">{userStats.total}</p>
            </CardContent>
          </Card>
          <Card className={roleFilter === 'admin' ? 'border-primary' : ''}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setRoleFilter('admin')}>
              <p className="text-sm text-muted-foreground mb-1">Admins</p>
              <p className="text-2xl font-bold text-red-600">{userStats.admin}</p>
            </CardContent>
          </Card>
          <Card className={roleFilter === 'customer' ? 'border-primary' : ''}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setRoleFilter('customer')}>
              <p className="text-sm text-muted-foreground mb-1">Customers</p>
              <p className="text-2xl font-bold text-green-600">{userStats.customer}</p>
            </CardContent>
          </Card>
          <Card className={roleFilter === 'staff' ? 'border-primary' : ''}>
            <CardContent className="p-4 cursor-pointer" onClick={() => setRoleFilter('staff')}>
              <p className="text-sm text-muted-foreground mb-1">Staff</p>
              <p className="text-2xl font-bold text-blue-600">{userStats.staff}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by username, email, or name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {roleFilter !== 'all' && (
                <Button variant="outline" onClick={() => setRoleFilter('all')}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={
              searchQuery || roleFilter !== 'all'
                ? "No users match your search or filter criteria."
                : "No users are registered yet."
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((userData, index) => (
              <motion.div
                key={userData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {userData.username.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {userData.first_name && userData.last_name 
                                ? `${userData.first_name} ${userData.last_name}`
                                : userData.username}
                            </h3>
                            {getUserRoleBadge(userData)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>@{userData.username}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{userData.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Joined {formatDate(userData.date_joined)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      {userData.is_customer && (
                        <div className="flex gap-6 ml-4">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                              <ShoppingBag className="h-4 w-4" />
                              <span>Orders</span>
                            </div>
                            <p className="text-xl font-bold">{userData.order_count || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                            <p className="text-xl font-bold">NPR {(userData.total_spent || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredUsers.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  {roleFilter !== 'all' && ` (${roleFilter})`}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Alert */}
        <Card className="mt-6 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1 text-blue-900">
                  User Management Notice
                </h3>
                <p className="text-sm text-blue-800">
                  This page displays user data for administrative purposes. User editing and role management features will be available in the full implementation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
