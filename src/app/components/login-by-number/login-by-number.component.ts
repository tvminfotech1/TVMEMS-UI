import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from 'src/app/models/baseurl/constant';
import { AlertService } from 'src/app/alert-service.service';

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
    private alertservice: AlertService
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
        .post(`${BASE_URL}/userlogin/mobile`, loginData)
        .subscribe({
          next: (res) => {
            const token = (res as any).token;
            if (token) {
              sessionStorage.setItem('token', token);
            } else {
              console.error('No token received from server:', res);
              this.alertservice.showError('Login failed: No token received.');
            }

            this.router.navigate(['/mainlayout/dashboard']);
          },
          error: (err) => {
            console.error('Login failed:', err);
            this.alertservice.showError(
              'Invalid credentials. Please check and try again'
            );
          },
        });
    } else {
      this.mobileLoginForm.markAllAsTouched();
      this.alertservice.showError('Please enter your credentials');
    }
  }
}
