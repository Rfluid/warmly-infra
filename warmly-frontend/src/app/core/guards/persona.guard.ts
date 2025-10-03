import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StackManagerService } from '../services/stack-manager.service';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const personaGuard: CanActivateFn = (route, state) => {
  const stackManager = inject(StackManagerService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const clientId = user.email?.split('@')[0] || user.uid;

  // Check if user has any stacks (persona created)
  return stackManager.listStacks(clientId).pipe(
    map(stacks => {
      if (stacks && stacks.length > 0) {
        // Has persona, allow access
        return true;
      } else {
        // No persona, redirect to wizard
        router.navigate(['/onboarding/persona']);
        return false;
      }
    }),
    catchError(error => {
      // If error (404, 0), assume no stacks
      router.navigate(['/onboarding/persona']);
      return of(false);
    })
  );
};


