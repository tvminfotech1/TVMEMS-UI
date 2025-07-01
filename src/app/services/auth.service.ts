import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  loginAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/adminlogin`, data);
  }
  register(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/register`, data);
}


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      const roles = decoded.roles;
      return Array.isArray(roles) ? roles[0] : roles;
    } catch (error) {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }

  checkRole(): Observable<any> {
    const token = this.getToken();
    if (!token) return of({ role: null });

    try {
      const decoded: any = jwtDecode(token);
      const roles = decoded.roles;
      return of({ role: Array.isArray(roles) ? roles[0] : roles });
    } catch (e) {
      return of({ role: null });
    }
  }
}
