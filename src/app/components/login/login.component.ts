import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      const { email, password } = loginData;

      // Local / Fake Login Logic
      if (email === 'user@local.com' && password === 'user123') {
        const fakePayload = {
          sub: 'Local User',
          roles: ['ROLE_USER'],
          empId: 'LOCAL001',
          fullName: 'Local Test User',
          exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };

        const base64UrlEncode = (obj: any) =>
          btoa(JSON.stringify(obj))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const header = { alg: 'HS256', typ: 'JWT' };
        const fakeToken = `${base64UrlEncode(header)}.${base64UrlEncode(fakePayload)}.signature`;

        localStorage.setItem('token', fakeToken);
        this.router.navigate(['/mainlayout/personal']);
        return;
      }

      // Real Backend Login Logic
      this.authService.loginUser(loginData).subscribe({
        next: (res) => {
          const role = this.authService.getUserRole();

          if (role === 'ROLE_USER') {
            this.router.navigate(['/mainlayout/personal']);
          } else if (role === 'ROLE_ADMIN') {
            this.router.navigate(['/mainlayout/admin-dashboard']);
          } else {
            this.errorMessage = 'Unauthorized role or no role found.';
            this.authService.logout();
          }
        },
        error: (err) => {
          console.error('Login error in component:', err);
          this.errorMessage = err.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please enter valid email and password.';
      this.loginForm.markAllAsTouched();
    }
  }
}