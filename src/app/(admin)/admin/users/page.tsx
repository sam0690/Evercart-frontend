'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  ShoppingBag,
  Calendar,
  Mail,
  Eye,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminUsers, useAdminDeleteUser } from '@/hooks/useAdminApi';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { enforceAdminAccess } from '@/services/adminAccessService';
import {
  RoleFilter,
  filterUsers,
  calculateUserStats,
  formatUserDisplayName,
  deleteUserAction,
} from '@/services/adminUsersService';
import type { User } from '@/types';
import { hasAdminAccess } from '@/lib/utils';

type UserData = User & {
  order_count?: number;
  total_spent?: number;
};

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const hasAccess = hasAdminAccess(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const { data: users = [], isLoading, isError } = useAdminUsers();
  const deleteMutation = useAdminDeleteUser();

  useEffect(() => {
    enforceAdminAccess({ user, authLoading, router });
  }, [user, authLoading, router]);

  const userList = users as UserData[];
  const filteredUsers = useMemo(
    () => filterUsers(userList, searchQuery, roleFilter),
    [userList, searchQuery, roleFilter],
  );
  const userStats = useMemo(() => calculateUserStats(userList), [userList]);

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (!hasAccess) {
    return null;
  }

  if (isError) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={Users}
            title="Unable to load users"
            description="There was a problem fetching the user list. Please try again."
          />
        </div>
      </main>
    );
  }

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
      return <Badge variant="outline">Customer</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  const handleDelete = (userToDelete: User) => {
    deleteUserAction({ user: userToDelete, mutation: deleteMutation });
  };

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            title="User Management"
            description="View, create, update, and delete user accounts"
          />
          <Link href="/admin/users/new">
            <Button className="md:w-auto w-full text-black " variant='outline'>Create User</Button>
          </Link>
        </div>

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

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
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

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={
              searchQuery || roleFilter !== 'all'
                ? 'No users match your search or filter criteria.'
                : 'No users are registered yet.'
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
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {userData.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {formatUserDisplayName(userData)}
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

                      <div className="flex flex-col gap-4 lg:items-end">
                        {userData.is_customer && (
                          <div className="flex gap-6">
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                <ShoppingBag className="h-4 w-4" />
                                <span>Orders</span>
                              </div>
                              <p className="text-xl font-bold">{userData.order_count || 0}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                              <p className="text-xl font-bold">
                                NPR {(userData.total_spent || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Link href={`/admin/users/${userData.id}`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(userData)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredUsers.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  {roleFilter !== 'all' && ` (${roleFilter})`}
                </span>
                {deleteMutation.isPending && <span className="text-muted-foreground">Applying changes…</span>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
