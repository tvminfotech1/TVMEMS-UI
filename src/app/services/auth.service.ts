


// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { jwtDecode } from 'jwt-decode';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private baseUrl = 'http://localhost:8080';

//   constructor(private http: HttpClient) {}

//   // Admin Login
//   loginAdmin(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}/adminlogin`, data);
//   }

//   // User Login
//   loginUser(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}/userlogin`, data);
//   }

//   // Registration (Admin creating user)
//   register(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}/admin/newuser`, data, {
//       responseType: 'text'
//     });
//   }

//   // Get JWT token from localStorage
//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }

//   // Decode Role from JWT token
//   getUserRole(): string | null {
//     const token = this.getToken();
//     if (!token) return null;

//     try {
//       const decoded: any = jwtDecode(token);
//       const roles = decoded.roles;
//       return Array.isArray(roles) ? roles[0] : roles;
//     } catch (error) {
//       return null;
//     }
//   }

//   // ✅ Check if Admin
//   isAdmin(): boolean {
//     return this.getUserRole() === 'ROLE_ADMIN';
//   }

//   // ✅ Check if User
//   isUser(): boolean {
//     return this.getUserRole() === 'ROLE_USER';
//   }

//   // ✅ For Guard – Get Role in Observable
//   checkRole(): Observable<any> {
//     const token = this.getToken();
//     if (!token) return of({ role: null });

//     try {
//       const decoded: any = jwtDecode(token);
//       const roles = decoded.roles;
//       return of({ role: Array.isArray(roles) ? roles[0] : roles });
//     } catch (e) {
//       return of({ role: null });
//     }
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Admin Login
  loginAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/adminlogin`, data);
  }

  // User Login
  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/userlogin`, data);
  }

  // Registration
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/newuser`, data, {
      responseType: 'text'
    });
  }

  // Get JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  //  Decode JWT safely
  getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (err) {
      console.error('JWT decode error:', err);
      return null;
    }
  }

  // Get Role from Token
  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    const roles = decoded?.roles;
    return Array.isArray(roles) ? roles[0] : roles || null;
  }

  // Get Employee ID
  getEmployeeId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.empId || null;
  }

  // Get Employee Name
  getfullName(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.sub || null;
  }

  //Is Admin?
  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }

  //Is User?
  isUser(): boolean {
    return this.getUserRole() === 'ROLE_USER';
  }

  //Guard Access – Observable
  checkRole(): Observable<any> {
    const role = this.getUserRole();
    return of({ role: role });
  }
}
