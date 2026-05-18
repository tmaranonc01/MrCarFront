import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../servicios/token';

export const soloAdminGuard: CanActivateFn = () => {
  const token = inject(TokenService);
  const router = inject(Router);

  if (!token.isLogged()) {
    return router.parseUrl('/login');
  }

  if (!token.isAdmin()) {
    return router.parseUrl('/piezas');
  }

  return true;
};
