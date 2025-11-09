import type { User } from '@/types';

interface EnforceAdminAccessOptions {
  user: User | null;
  authLoading: boolean;
  router: { push: (href: string) => void };
  redirectTo?: string;
}

export function enforceAdminAccess({
  user,
  authLoading,
  router,
  redirectTo = '/admin/login',
}: EnforceAdminAccessOptions) {
  if (!authLoading && (!user || !user.is_admin)) {
    router.push(redirectTo);
  }
}
