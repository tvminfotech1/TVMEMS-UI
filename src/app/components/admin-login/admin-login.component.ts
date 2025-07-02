import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.css"],
})
export class AdminLoginComponent {
  public adminLoginForm: FormGroup;
  public loginError: string = "";

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.adminLoginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  // public onAdminLogin(): void {
  //   if (this.adminLoginForm.valid) {
  //     const loginData = this.adminLoginForm.value;

  //     this.http.post<any>("http://localhost:8080/adminlogin", loginData).subscribe({
  //       next: (res) => {
  //         try {
  //           const token = res.token;
  //           const decoded: any = jwtDecode(token); // ✅ Decode JWT
  //           const roles = decoded.roles;

  //           if (Array.isArray(roles) && roles.includes('ROLE_ADMIN')) {
  //             localStorage.setItem("token", token);
  //             this.router.navigate(["/mainlayout/dashboard"]);
  //           } else {
  //             this.loginError = "You are not authorized as admin.";
  //           }
  //         } catch (e) {
  //           this.loginError = "Token decode error.";
  //         }
  //       },
  //       error: () => {
  //       // ✅ FALLBACK DEFAULT LOGIN CHECK
  //       const { email, password } = loginData;
  //       if (email === 'admin@local.com' && password === 'admin123') {
  //         // Simulate a token and role
  //         const fakeToken = 'fake-jwt-token';
  //         localStorage.setItem("token", fakeToken);
  //         this.router.navigate(["/mainlayout/dashboard"]);
  //       } else {
  //         this.loginError = "Invalid credentials or server error.";
  //       }
  //     }
  //     });
  //   } else {
  //     this.adminLoginForm.markAllAsTouched();
  //     this.loginError = "Please enter valid login details.";
  //   }
  // }
  public onAdminLogin(): void {
  if (this.adminLoginForm.valid) {
    const loginData = this.adminLoginForm.value;
    const { email, password } = loginData;

    // ✅ Step 1: If default fake login
    if (email === 'admin@local.com' && password === 'admin123') {
      const fakeToken = 'fake-jwt-token';
      localStorage.setItem("token", fakeToken);
      this.router.navigate(["/mainlayout/dashboard"]);
      return; // 🛑 Don't proceed to backend
    }

    // ✅ Step 2: Else call backend
    this.http.post<any>("http://localhost:8080/adminlogin", loginData).subscribe({
      next: (res) => {
        try {
          const token = res.token;
          const decoded: any = jwtDecode(token);
          const roles = decoded.roles;

          if (Array.isArray(roles) && roles.includes('ROLE_ADMIN')) {
            localStorage.setItem("token", token);
            this.router.navigate(["/mainlayout/dashboard"]);
          } else {
            this.loginError = "You are not authorized as admin.";
          }
        } catch (e) {
          this.loginError = "Token decode error.";
        }
      },
      error: () => {
        this.loginError = "Invalid credentials or server error.";
      }
    });
  } else {
    this.adminLoginForm.markAllAsTouched();
    this.loginError = "Please enter valid login details.";
  }
}

}
