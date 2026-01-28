import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../stores/user.store';

export const companyGuard: CanActivateFn = async (route, state) => {
  const store = inject(UserStore);
  const router = inject(Router);

  while (store.loading()) {
    await new Promise((r) => setTimeout(r, 20));
  }

  const user = store.user();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const allowed = user.accountType === 'company' || !!user.companyId;

  if (!allowed) {
    return router.createUrlTree(['/']);
  }

  return true;
};
