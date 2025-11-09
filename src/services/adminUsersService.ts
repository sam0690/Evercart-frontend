import { toast } from 'sonner';
import type {
  User,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
} from '@/types';

export type RoleFilter = 'all' | 'admin' | 'customer' | 'staff';

export interface UserRoleStats {
  total: number;
  admin: number;
  customer: number;
  staff: number;
}

export interface AdminUserFormState {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isCustomer: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
}

interface DeleteMutation {
  mutate: (
    variables: number,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => void;
  isPending: boolean;
}

export function createInitialAdminUserForm(): AdminUserFormState {
  return {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    isCustomer: true,
    isAdmin: false,
    isStaff: false,
    isSuperuser: false,
  };
}

export function populateAdminUserForm(user: User): AdminUserFormState {
  return {
    username: user.username || '',
    email: user.email || '',
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    password: '',
    isCustomer: Boolean(user.is_customer),
    isAdmin: Boolean(user.is_admin),
    isStaff: Boolean(user.is_staff),
    isSuperuser: Boolean(user.is_superuser),
  };
}

function normalizePayloadBase(form: AdminUserFormState) {
  const base: AdminUserCreatePayload = {
    username: form.username.trim(),
    email: form.email.trim(),
    first_name: form.firstName.trim() || undefined,
    last_name: form.lastName.trim() || undefined,
    is_customer: form.isCustomer,
    is_admin: form.isAdmin,
    is_staff: form.isStaff,
    is_superuser: form.isSuperuser,
  };

  if (!base.username) {
    return { error: 'Username is required' } as const;
  }

  if (!base.email) {
    return { error: 'Email is required' } as const;
  }

  return { base } as const;
}

export function buildAdminUserCreatePayload(
  form: AdminUserFormState,
): { payload?: AdminUserCreatePayload; error?: string } {
  const result = normalizePayloadBase(form);
  if ('error' in result) {
    return { error: result.error };
  }

  const payload: AdminUserCreatePayload = {
    ...result.base,
  };

  if (form.password.trim()) {
    if (form.password.trim().length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }
    payload.password = form.password.trim();
  }

  return { payload };
}

export function buildAdminUserUpdatePayload(
  form: AdminUserFormState,
): { payload?: AdminUserUpdatePayload; error?: string } {
  const result = normalizePayloadBase(form);
  if ('error' in result) {
    return { error: result.error };
  }

  const payload: AdminUserUpdatePayload = {
    ...result.base,
  };

  if (form.password.trim()) {
    if (form.password.trim().length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }
    payload.password = form.password.trim();
  }

  return { payload };
}

export function filterUsers<T extends User>(users: T[], searchQuery: string, roleFilter: RoleFilter): T[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return users.filter((user) => {
    const matchesSearch =
      !normalizedQuery ||
      user.username.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(normalizedQuery);

    if (!matchesSearch) {
      return false;
    }

    if (roleFilter === 'all') {
      return true;
    }

    if (roleFilter === 'admin') {
      return Boolean(user.is_admin);
    }

    if (roleFilter === 'staff') {
      return Boolean(user.is_staff) && !user.is_admin;
    }

    if (roleFilter === 'customer') {
      return Boolean(user.is_customer) && !user.is_admin;
    }

    return true;
  });
}

export function calculateUserStats(users: User[]): UserRoleStats {
  return users.reduce(
    (acc, user) => {
      acc.total += 1;
      if (user.is_admin) acc.admin += 1;
      else if (user.is_staff) acc.staff += 1;
      else if (user.is_customer) acc.customer += 1;
      return acc;
    },
    { total: 0, admin: 0, customer: 0, staff: 0 } as UserRoleStats,
  );
}

export function formatUserDisplayName(user: User): string {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return fullName || user.username;
}

export function deleteUserAction(options: {
  user: User;
  mutation: DeleteMutation;
  confirmFn?: (message: string) => boolean;
  onSuccess?: () => void;
}) {
  const { user, mutation, confirmFn, onSuccess } = options;
  const defaultConfirm = (message: string) =>
    typeof window !== 'undefined' ? window.confirm(message) : true;

  const proceed = (confirmFn || defaultConfirm)(
    `Delete user ${formatUserDisplayName(user)}? This action cannot be undone.`,
  );
  if (!proceed) {
    return;
  }

  mutation.mutate(user.id, {
    onSuccess: () => {
      toast.success('User deleted successfully');
      onSuccess?.();
    },
    onError: () => toast.error('Failed to delete user'),
  });
}
