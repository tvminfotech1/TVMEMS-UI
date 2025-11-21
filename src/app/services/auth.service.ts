import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { jwtDecode } from "jwt-decode";
import { Router } from "@angular/router";
import { BASE_URL } from "../models/baseurl/constant";

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
  providedIn: "root",
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}

  private saveToken(token: string): void {
    sessionStorage.setItem("token", token);
  }

  loginAdmin(data: any): Observable<any> {
    return this.http
      .post(`${BASE_URL}/adminlogin`, data, { observe: "response" })
      .pipe(
        tap((response: HttpResponse<any>) => {
          const token =
            response.headers.get("Authorization") || response.body?.token;
          if (token) {
            this.saveToken(
              token.startsWith("Bearer ") ? token.substring(7) : token
            );
          } else {
            console.warn(
              "Login Admin: Token not found in response header or body."
            );
            throw new Error("Authentication failed: Token not received.");
          }
        }),
        map((response) => response.body),
        catchError((error) => {
          console.error("Login Admin failed:", error);
          return throwError(
            () => new Error("Admin login failed. Please check credentials.")
          );
        })
      );
  }

  loginUser(data: any): Observable<any> {
    return this.http
      .post(`${BASE_URL}/userlogin`, data, { observe: "response" })
      .pipe(
        tap((response: HttpResponse<any>) => {
          const token =
            response.headers.get("Authorization") || response.body?.token;
          if (token) {
            const pureToken = token.startsWith("Bearer ")
              ? token.substring(7)
              : token;
            this.saveToken(pureToken);

            const decoded: DecodedToken = jwtDecode(pureToken);
            if (decoded?.empId) {
              sessionStorage.setItem("employeeId", decoded.empId.toString());
            } else {
              console.warn("⚠ No employee ID found in token!");
            }
          } else {
            console.warn(
              "Login User: Token not found in response header or body."
            );
            throw new Error("Authentication failed: Token not received.");
          }
        }),
        map((response) => response.body),
        catchError((error) => {
          console.error("Login User failed:", error);
          return throwError(
            () => new Error("User login failed. Please check credentials.")
          );
        })
      );
  }

  register(data: any): Observable<any> {
    return this.http
      .post(`${BASE_URL}/admin/newuser`, data, {
        responseType: "json",
      })
      .pipe(
        catchError((error) => {
          console.error("Registration failed:", error);
          return throwError(() => error);
        })
      );
  }

  checkEmailExists(email: string) {
    return this.http.get<boolean>(`${BASE_URL}/users/check-email/${email}`);
  }

  checkMobileExists(mobile: string) {
    return this.http.get<boolean>(
      `${BASE_URL}/users/check-mobile/${mobile}`
    );
  }

  getToken(): string | null {
    const token = sessionStorage.getItem("token");
    if (token && this.isTokenExpired(token)) {
      console.warn("JWT token is expired. Logging out.");
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
      console.error("JWT decode error:", err);
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
      console.error("Error checking token expiry:", e);
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

  getUserEmail(): string | null {
    const token = sessionStorage.getItem("token");
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded.sub || decoded.email || null;
  }

  getfullName(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.fullName || decoded?.name || decoded?.sub || null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === "ROLE_ADMIN";
  }

  isUser(): boolean {
    return this.getUserRole() === "ROLE_USER";
  }

  checkRole(): Observable<any> {
    const role = this.getUserRole();
    return of({ role: role });
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigateByUrl("/adminLogin");
  }
  getEmailFromToken(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.sub || null;
  }

  getUserId(email: string): Observable<number> {
    return this.http.get<number>(
      `${BASE_URL}/WFH/employeeId?email=${email}`
    );
  }

  checkOnboardingStatus(employeeId: string | null): Observable<boolean> {
    const url = `${BASE_URL}/final/check-status/${employeeId}`;
    return this.http.get<boolean>(url);
  }
}
