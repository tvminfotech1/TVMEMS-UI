import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-by-number',
  templateUrl: './login-by-number.component.html',
  styleUrls: ['./login-by-number.component.css'],
})
export class LoginByNumberComponent implements OnInit {
  mobileLoginForm!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.mobileLoginForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', Validators.required],
    });
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  back(): void {
    this.router.navigate(['/']);
  }
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.mobileLoginForm.valid) {
      const loginData = {
        mobile: this.mobileLoginForm.value.mobile,
        password: this.mobileLoginForm.value.password,
      };

      this.http
        .post('http://localhost:8080/userlogin/mobile', loginData)
        .subscribe({
          next: (res) => {
            console.log('Login successful:', res);
            const token = (res as any).token;
            if (token) {
              localStorage.setItem('token', token);
            } else {
              console.error('No token received from server:', res);
              this.snackBar.open('Login failed: No token received.', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
              });
            }

            this.router.navigate(['/mainlayout/personal']);
          },
          error: (err) => {
            console.error('Login failed:', err);
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
      this.mobileLoginForm.markAllAsTouched();
      this.snackBar.open('Please enter your credentials', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }
}
