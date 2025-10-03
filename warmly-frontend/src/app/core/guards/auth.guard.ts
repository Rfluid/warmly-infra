import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, skipWhile } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth state to be initialized (skip null state while loading)
  return authService.authStateLoaded$.pipe(
    skipWhile(loaded => !loaded), // Wait until Firebase auth state is loaded
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }

      // Redirect to login page with return url
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};


