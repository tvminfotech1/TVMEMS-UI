import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (!token) {
    router.navigate(['/adminLogin']);
    return of(false);
  }

  try {
    const decoded: any = jwtDecode(token);
    const roles = decoded.roles;

    if (Array.isArray(roles) && roles.includes('ROLE_ADMIN')) {
      return of(true);
    } else {
      router.navigate(['/unauthorized']);
      return of(false);
    }
  } catch {
    router.navigate(['/adminLogin']);
    return of(false);
  }
};
