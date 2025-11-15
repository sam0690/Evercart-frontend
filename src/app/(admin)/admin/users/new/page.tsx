'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAdminCreateUser } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { PageLoader } from '@/components/shared/Loader';
import { enforceAdminAccess } from '@/services/adminAccessService';
import {
  createInitialAdminUserForm,
  buildAdminUserCreatePayload,
  AdminUserFormState,
} from '@/services/adminUsersService';
import { hasAdminAccess } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminCreateUserPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const createUserMutation = useAdminCreateUser();
  const [form, setForm] = useState<AdminUserFormState>(createInitialAdminUserForm());
  const hasAccess = hasAdminAccess(user);

  useEffect(() => {
    enforceAdminAccess({ user, authLoading, router });
  }, [user, authLoading, router]);

  if (authLoading) {
    return <PageLoader />;
  }

  if (!hasAccess) {
    return null;
  }

  const handleFieldChange = (field: keyof AdminUserFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { payload, error } = buildAdminUserCreatePayload(form);
    if (error || !payload) {
      toast.error(error || 'Invalid user data');
      return;
    }

    createUserMutation.mutate(payload, {
      onSuccess: (response) => {
        const created = response?.data;
        toast.success('User created successfully');
        setForm(createInitialAdminUserForm());
        if (created?.id) {
          router.push(`/admin/users/${created.id}`);
        } else {
          router.push('/admin/users');
        }
      },
      onError: () => {
        toast.error('Failed to create user');
      },
    });
  };

  return (
    <main className="flex-1 bg-ambient-soft">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <SectionTitle
            title="Create User"
            description="Add a new user account to the system"
          />
          <Link href="/admin/users">
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>

        <Card className="glass-card border border-white/20">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create-user-username" className="mb-1 block text-sm font-medium text-muted-foreground">
                    Username
                  </label>
                  <Input
                    id="create-user-username"
                    value={form.username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    placeholder="Unique username"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="create-user-email" className="mb-1 block text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="create-user-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="create-user-first-name" className="mb-1 block text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <Input
                    id="create-user-first-name"
                    value={form.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="create-user-last-name" className="mb-1 block text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <Input
                    id="create-user-last-name"
                    value={form.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="create-user-password" className="mb-1 block text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <Input
                    id="create-user-password"
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
                  onClick={() => setForm(createInitialAdminUserForm())}
                  disabled={createUserMutation.isPending}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending} className="text-black">
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
