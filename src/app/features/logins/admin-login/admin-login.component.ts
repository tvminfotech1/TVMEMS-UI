import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BASE_URL } from 'src/app/core/constant/constant';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  public adminLoginForm: FormGroup;
  public loginError: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private alertservice: AlertService
  ) {
    this.adminLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  back(): void {
    this.router.navigate(['/']);
  }

  onAdminLogin(): void {
    if (this.adminLoginForm.valid) {
      const loginData = this.adminLoginForm.value;
      this.http
        .post<any>(`${BASE_URL}/adminlogin`, loginData)
        .subscribe({
          next: (res) => {
            const token = res.token;
            sessionStorage.setItem('token', token);
            this.router.navigate(['/mainlayout/dashboard']);
          },
          error: () => {
            this.alertservice.showError(
              'Invalid credentials. Please check and try again'
            );
          },
        });
    } else {
      this.adminLoginForm.markAllAsTouched();
      this.alertservice.showError('Please enter your credentials');
    }
  }
}
