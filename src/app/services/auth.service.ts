import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface DecodedToken {
  sub: string;
  roles: string | string[];
  empId?: string;
  fullName?: string;
  name?: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private router: Router) {}

  private saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  loginAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/adminlogin`, data, { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        const token = response.headers.get('Authorization') || response.body?.token;
        if (token) {
          this.saveToken(token.startsWith('Bearer ') ? token.substring(7) : token);
        } else {
          console.warn('Login Admin: Token not found in response header or body.');
          throw new Error('Authentication failed: Token not received.');
        }
      }),
      map(response => response.body),
      catchError(error => {
        console.error('Login Admin failed:', error);
        return throwError(() => new Error('Admin login failed. Please check credentials.'));
      })
    );
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/userlogin`, data, { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        const token = response.headers.get('Authorization') || response.body?.token;
        if (token) {
          this.saveToken(token.startsWith('Bearer ') ? token.substring(7) : token);
        } else {
          console.warn('Login User: Token not found in response header or body.');
          throw new Error('Authentication failed: Token not received.');
        }
      }),
      map(response => response.body),
      catchError(error => {
        console.error('Login User failed:', error);
        return throwError(() => new Error('User login failed. Please check credentials.'));
      })
    );
  }

  register(data: any): Observable<string> {
    return this.http.post(`${this.baseUrl}/admin/newuser`, data, {
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Registration failed:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (token && this.isTokenExpired(token)) {
        console.warn('JWT token is expired. Logging out.');
        this.logout();
        return null;
    }
    return token;
  }

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (err) {
      console.error('JWT decode error:', err);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.exp === undefined) {
        return false;
      }
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (e) {
      console.error('Error checking token expiry:', e);
      return true;
    }
  }

  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    const roles = decoded?.roles;
    return Array.isArray(roles) ? roles[0] : roles || null;
  }

  getEmployeeId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.empId || null;
  }

  

  getfullName(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.fullName || decoded?.name || decoded?.sub || null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.getUserRole() === 'ROLE_USER';
  }

  checkRole(): Observable<any> {
    const role = this.getUserRole();
    return of({ role: role });
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigateByUrl('/adminLogin');
  }
   getEmailFromToken(): string | null {
  const decoded = this.getDecodedToken();
  return decoded?.sub || null;
}

getUserId(email: string): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/WFH/employeeId?email=${email}`);
}

}