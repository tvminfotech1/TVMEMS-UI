import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: { fullName: string; employeeId: string; roles: string[] } | null = null;

  constructor() { 
    // Ideally initialize or retrieve user info from token/localstorage here
    this.user = {
      fullName: 'John Doe',
      employeeId: 'EMP123',
      roles: ['user']  // or ['admin']
    };
  }

  getfullName(): string | null {
    return this.user ? this.user.fullName : null;
  }

  getEmployeeId(): string | null {
    return this.user ? this.user.employeeId : null;
  }

  isAdmin(): boolean {
    return this.user?.roles.includes('admin') || false;
  }

  isUser(): boolean {
    return this.user !== null;
  }

  // Optional: Add login/logout and token management here
}
