import type { User } from '@/types';
import { hasAdminAccess } from '@/lib/utils';

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
  if (!authLoading && !hasAdminAccess(user)) {
    router.push(redirectTo);
  }
}
