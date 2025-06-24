

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-by-number',
  templateUrl: './login-by-number.component.html',
  styleUrls: ['./login-by-number.component.css']
})
export class LoginByNumberComponent implements OnInit {
  mobileLoginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.mobileLoginForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.mobileLoginForm.valid) {
      const loginData = {
        mobile: this.mobileLoginForm.value.mobile,
        password: this.mobileLoginForm.value.password
      };

      this.http.post('http://localhost:8080/employee/verifyByPhone', loginData).subscribe({
        next: (res) => {
          console.log('Login successful:', res);
          // localStorage.setItem('token', 'true'); // token or flag
          this.router.navigate(['/personal']);
        },
        error: (err) => {
          console.error('Login failed:', err);
        }
      });
    } else {
      this.mobileLoginForm.markAllAsTouched();
    }
  }
}
