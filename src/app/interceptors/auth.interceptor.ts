import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../servicios/token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Endpoints de autenticacion sin bearer.
  if (req.url.startsWith('/api/auth/')) return next(req);

  const token = inject(TokenService).getToken();
  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
