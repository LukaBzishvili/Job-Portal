import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      const isAuthRoute =
        route.routeConfig?.path === 'login' || route.routeConfig?.path === 'register';

      if (user && isAuthRoute) {
        router.navigateByUrl('/');
        resolve(false);
      } else if (!user && !isAuthRoute) {
        router.navigateByUrl('/login');
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
