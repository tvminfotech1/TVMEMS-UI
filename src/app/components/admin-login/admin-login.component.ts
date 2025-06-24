import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

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

  public onAdminLogin(): void {
    if (this.adminLoginForm.valid) {
      const loginData = this.adminLoginForm.value;

      // Load JSON file from assets folder
      this.http.get<any[]>("assets/users.json").subscribe({
        next: (users) => {
          const matchedUser = users.find(
            (user) =>
              user.email === loginData.email &&
              user.password === loginData.password
          );

          if (matchedUser) {
            this.router.navigate(["/mainlayout/dashboard"]);
          } else {
            this.loginError = "Admin email or password is incorrect";
          }
        },
        error: (err) => {
          console.error("Error loading admin users JSON:", err);
          this.loginError = "An error occurred. Please try again later.";
        },
      });
    } else {
      this.adminLoginForm.markAllAsTouched();
    }
    this.loginError = "";
  }
}
