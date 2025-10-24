import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return of(false);
  }

  try {
    const decoded: any = jwtDecode(token);
    const roles = decoded.roles;

    if (
      (Array.isArray(roles) && (roles.includes('ROLE_USER') || roles.includes('ROLE_ADMIN'))) ||
      (typeof roles === 'string' && (roles === 'ROLE_USER' || roles === 'ROLE_ADMIN'))
    ) {
      return of(true);
    } else {
      router.navigate(['/unauthorized']);
      return of(false);
    }
  } catch (err) {
    console.error('JWT Decode Error:', err);
    router.navigate(['/login']);
    return of(false);
  }
};
