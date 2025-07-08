// import { Component, OnInit } from "@angular/core";
// import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// import { HttpClient } from "@angular/common/http";
// import { Router } from "@angular/router";

// @Component({
//   selector: "app-login",
//   templateUrl: "./login.component.html",
//   styleUrls: ["./login.component.css"],
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   errorMessage: string = "";
//   loginError: string = "";

//   constructor(
//     private fb: FormBuilder,
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       email: ["", [Validators.required, Validators.email]],
//       password: ["", Validators.required],
//     });
//   }

//   onSubmit(): void {
//     this.errorMessage = "";

//     if (this.loginForm.valid) {
//       const loginData = this.loginForm.value;

//       this.http.get<any[]>("http://localhost:8080").subscribe({
//         next: (users) => {
//           const matchedUser = users.find(
//             (user) =>
//               user.email === loginData.email &&
//               user.password === loginData.password
//           );

//           if (matchedUser) {
//             this.router.navigate(["personal"]);
//           } else {
//             this.errorMessage = "Invalid email or password";
//           }
//         },
//         error: (err) => {
//           console.error("Error loading JSON:", err);
//           this.errorMessage = "Something went wrong. Please try again.";
//         },
//       });
//     } else {
//       this.loginForm.markAllAsTouched();
//     }
//   }

  //   onSubmit(): void {
  //     if (this.loginForm.valid) {
  //       const loginData = this.loginForm.value;

  //       this.http.post<any>('http://localhost:8080/employee/verifyByEmail', loginData).subscribe({
  //     next: (res) => {
  //       console.log('Login successful:', res);
  //       const empId = res?.body?.id;
  //       if (empId !== undefined) {
  //         localStorage.setItem('empId', empId.toString());
  //         console.log(empId);
  //         this.router.navigate(['/personal']);
  //       } else {
  //         console.error('empId not found in response body');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Login failed:', err);
  //     }
  //   });
  //     } else {
  //       this.loginForm.markAllAsTouched();
  //     }
  //   }
// }
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

      // ✅ Fake login for development
      if (email === 'user@local.com' && password === 'user123') {
        const payload = {
  sub: 'user',
  roles: ['ROLE_USER'],
  exp: Math.floor(Date.now() / 1000) + 60 * 60
};

       const base64UrlEncode = (obj: any) =>
  btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const header = { alg: 'HS256', typ: 'JWT' };
const fakeToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.signature`;

localStorage.setItem('token', fakeToken);
        this.router.navigate(['/mainlayout/personal']);
        return;
      }

      // ✅ Real login via backend
      this.authService.loginUser(loginData).subscribe({
        next: (res) => {
          const token = res?.token;
          if (token) {
            localStorage.setItem('token', token);

            const role = this.authService.getUserRole();
            if (role === 'ROLE_USER') {
              this.router.navigate(['/mainlayout/personal']);
            } else {
              this.errorMessage = 'Unauthorized role.';
            }
          } else {
            this.errorMessage = 'Invalid response from server.';
          }
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = 'Invalid email or password.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
