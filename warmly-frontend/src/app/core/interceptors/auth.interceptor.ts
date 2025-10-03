import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the token asynchronously
  return from(authService.getToken()).pipe(
    switchMap(token => {
      // Clone the request and add the authorization header if we have a token
      if (token) {
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(cloned);
      }
      
      // If no token, proceed with the original request
      return next(req);
    })
  );
};


