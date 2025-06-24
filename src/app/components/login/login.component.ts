import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = "";
  loginError: string = "";

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  onSubmit(): void {
    this.errorMessage = "";

    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.http.get<any[]>("assets/users.json").subscribe({
        next: (users) => {
          const matchedUser = users.find(
            (user) =>
              user.email === loginData.email &&
              user.password === loginData.password
          );

          if (matchedUser) {
            this.router.navigate(["personal"]);
          } else {
            this.errorMessage = "Invalid email or password";
          }
        },
        error: (err) => {
          console.error("Error loading JSON:", err);
          this.errorMessage = "Something went wrong. Please try again.";
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

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
}
