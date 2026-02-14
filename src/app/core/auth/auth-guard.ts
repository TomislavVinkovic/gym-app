import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!auth.isVerified()) {
     // Prevent infinite loop if we are already going to verify-email
     if (state.url.includes('verify-email')) {
       return true;
     }
     return router.createUrlTree(['/verify-email']);
  }

  return true;
};
