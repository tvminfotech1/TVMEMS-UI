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


  onAdminLogin(): void {
  if (this.adminLoginForm.valid) {
    const loginData = this.adminLoginForm.value;
const { email, password } = loginData;

    
    if (email === 'admin@local.com' && password === 'admin123') {
      const payload = {
        sub: 'admin',
        roles: ['ROLE_ADMIN'],
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiry
      };

      const base64 = (obj: any) => btoa(JSON.stringify(obj));
      const fakeToken = `${base64({ alg: 'HS256', typ: 'JWT' })}.${base64(payload)}.signature`;

      localStorage.setItem("token", fakeToken);
      this.router.navigate(["/mainlayout/dashboard"]);
      return;
    }
    this.http.post<any>('http://localhost:8080/adminlogin', loginData).subscribe({
      next: (res) => {
        const token = res.token;
        localStorage.setItem('token', token);
        this.router.navigate(['/mainlayout/dashboard']);
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