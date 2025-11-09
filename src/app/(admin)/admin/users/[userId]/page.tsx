'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Mail,
  Shield,
  Users,
  Trash2,
  Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  useAdminUser,
  useAdminUpdateUser,
  useAdminDeleteUser,
} from '@/hooks/useAdminApi';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { enforceAdminAccess } from '@/services/adminAccessService';
import {
  AdminUserFormState,
  createInitialAdminUserForm,
  populateAdminUserForm,
  buildAdminUserUpdatePayload,
  formatUserDisplayName,
  deleteUserAction,
} from '@/services/adminUsersService';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params?.userId);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    data: userData,
    isLoading,
    isError,
    refetch,
  } = useAdminUser(Number.isNaN(userId) ? undefined : userId);

  const updateMutation = useAdminUpdateUser();
  const deleteMutation = useAdminDeleteUser();

  const [form, setForm] = useState<AdminUserFormState>(createInitialAdminUserForm());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    enforceAdminAccess({ user, authLoading, router });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (userData && !initialized) {
      setForm(populateAdminUserForm(userData));
      setInitialized(true);
    }
  }, [userData, initialized]);

  if (authLoading || Number.isNaN(userId)) {
    return <PageLoader />;
  }

  if (!user || !user.is_admin) {
    return null;
  }

  if (isLoading || (!initialized && !isError)) {
    return <PageLoader />;
  }

  if (isError || !userData) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon={Users}
            title="User not found"
            description="The requested user could not be located."
          />
          <div className="mt-6">
            <Link href="/admin/users">
              <Button>Back to Users</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleFieldChange = (field: keyof AdminUserFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { payload, error } = buildAdminUserUpdatePayload(form);
    if (error || !payload) {
      toast.error(error || 'Invalid user data');
      return;
    }

    updateMutation.mutate(
      { id: userId, payload },
      {
        onSuccess: () => {
          toast.success('User updated successfully');
          setInitialized(false);
          refetch();
        },
        onError: () => toast.error('Failed to update user'),
      },
    );
  };

  const handleReset = () => {
    if (userData) {
      setForm(populateAdminUserForm(userData));
      setInitialized(true);
    } else {
      setForm(createInitialAdminUserForm());
    }
  };

  const handleDelete = () => {
    deleteUserAction({
      user: userData,
      mutation: deleteMutation,
      onSuccess: () => {
        router.push('/admin/users');
      },
    });
  };

  return (
    <main className="flex-1 bg-ambient-soft">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionTitle
            title={formatUserDisplayName(userData)}
            description={`Manage user #${userData.id}`}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/admin/users">
              <Button variant="outline">Back to Users</Button>
            </Link>
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="glass-card border border-white/20">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="detail-user-username" className="mb-1 block text-sm font-medium text-muted-foreground">
                      Username
                    </label>
                    <Input
                      id="detail-user-username"
                      value={form.username}
                      onChange={(e) => handleFieldChange('username', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="detail-user-email" className="mb-1 block text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      id="detail-user-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="detail-user-first-name" className="mb-1 block text-sm font-medium text-muted-foreground">
                      First Name
                    </label>
                    <Input
                      id="detail-user-first-name"
                      value={form.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="detail-user-last-name" className="mb-1 block text-sm font-medium text-muted-foreground">
                      Last Name
                    </label>
                    <Input
                      id="detail-user-last-name"
                      value={form.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="detail-user-password" className="mb-1 block text-sm font-medium text-muted-foreground">
                      Password (leave blank to keep current)
                    </label>
                    <Input
                      id="detail-user-password"
                      type="password"
                      value={form.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.isCustomer}
                      onChange={(e) => handleFieldChange('isCustomer', e.target.checked)}
                    />
                    <span>Customer access</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.isStaff}
                      onChange={(e) => handleFieldChange('isStaff', e.target.checked)}
                    />
                    <span>Staff permissions</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.isAdmin}
                      onChange={(e) => handleFieldChange('isAdmin', e.target.checked)}
                    />
                    <span>Admin permissions</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.isSuperuser}
                      onChange={(e) => handleFieldChange('isSuperuser', e.target.checked)}
                    />
                    <span>Superuser</span>
                  </label>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={updateMutation.isPending}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 text-black"
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="self-start">
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-lg font-semibold">#{userData.id}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(userData.date_joined)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>@{userData.username}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Roles</p>
                <div className="flex flex-wrap gap-2">
                  {userData.is_admin && (
                    <Badge className="bg-red-100 text-red-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {userData.is_staff && !userData.is_admin && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Staff
                    </Badge>
                  )}
                  {userData.is_customer && (
                    <Badge variant="outline">Customer</Badge>
                  )}
                  {!userData.is_admin && !userData.is_staff && !userData.is_customer && (
                    <Badge variant="outline">User</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
