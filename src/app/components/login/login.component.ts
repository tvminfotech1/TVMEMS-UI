import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  back(): void {
    this.router.navigate(['/']);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      const { email, password } = loginData;

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

          this.snackBar.open(
            'Invalid credentials. Please check and try again',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Please enter your credentials', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }
}