// import { CanActivateFn, Router } from '@angular/router';
// import { inject } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { map, catchError, of } from 'rxjs';

// export const adminAuthGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   return authService.checkRole().pipe(
//     map(res => {
//       if (res.role === 'admin') {
//         return true;
//       } else {
//         router.navigate(['/login']);
//         return false;
//       }
//     }),
//     catchError(err => {
//       router.navigate(['/login']);
//       return of(false);
//     })
//   );
// };
