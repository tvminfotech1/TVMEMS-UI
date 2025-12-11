import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { BreakpointObserver } from "@angular/cdk/layout";
import { Observable, map } from "rxjs";
import { ChangePasswordService } from "src/app/change-password.service";
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { ChangeDetectorRef } from "@angular/core";
import { AlertService } from "src/app/alert-service.service";

@Component({
  standalone: true,
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
})
export class ChangePasswordComponent implements OnInit {
  fb = inject(FormBuilder);
  bp = inject(BreakpointObserver);
  passwordService = inject(ChangePasswordService);
  authService = inject(AuthService);

  showPrevious = false;
  showNew = false;
  showConfirm = false;

  isPrevPasswordValid = false;

  employeeEmail = "";
  employeeMobile = "";

  selectedStep = 0;

  checking: boolean = false;

  stepperOrientation: Observable<"horizontal" | "vertical"> = this.bp
    .observe("(min-width: 800px)")
    .pipe(map((result) => (result.matches ? "horizontal" : "vertical")));

  userDetailsGroup = this.fb.group({
    email: [{ value: "", disabled: true }],
    mobile: [{ value: "", disabled: true }],
    password: ["", Validators.required],
  });

  newPassGroup: FormGroup = this.fb.group(
    {
      newPassword: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$&!%*?^]).{8,}$/
          ),
        ],
      ],
      confirmPassword: ["", Validators.required],
    },
    {
      validators: [
        this.passwordMatchValidator,
        this.oldNewPasswordValidator.bind(this),
      ],
    }
  );

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private alertservice: AlertService
  ) {}

  

  ngOnInit(): void {
    const empId = this.authService.getEmployeeId();

    if (!empId) {
      return;
    }

    this.authService.getUserDetails(Number(empId)).subscribe({
      next: (data: { email: string; mobile: string }) => {
        this.employeeEmail = data.email;
        this.employeeMobile = data.mobile;

        this.userDetailsGroup.patchValue({
          email: data.email,
          mobile: data.mobile,
        });

        this.userDetailsGroup.get("email")?.disable();
        this.userDetailsGroup.get("mobile")?.disable();
      },
    });
    this.userDetailsGroup.get("password")?.valueChanges.subscribe(() => {
      this.newPassGroup.updateValueAndValidity({
        onlySelf: false,
        emitEvent: true,
      });
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get("newPassword")?.value;
    const confirmPass = form.get("confirmPassword")?.value;

    if (!newPass || !confirmPass) {
      form.get("confirmPassword")?.setErrors({ passwordRequired: true });
      return { passwordRequired: true };
    }

    if (newPass !== confirmPass) {
      form.get("confirmPassword")?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    form.get("confirmPassword")?.setErrors(null);
    return null;
  }

  oldNewPasswordValidator(form: FormGroup) {
    const oldPassword = this.userDetailsGroup.get("password")?.value;
    const newPassword = form.get("newPassword")?.value;

    if (oldPassword && newPassword && oldPassword === newPassword) {
      form.get("newPassword")?.setErrors({ sameAsOld: true });
      return { sameAsOld: true };
    }

    return null;
  }

  onNextClick(stepper: MatStepper) {
    const control = this.userDetailsGroup.get("password");

    control?.markAsTouched();
    control?.updateValueAndValidity();

    if (!control?.value) {
      this.alertservice.showError("Please enter your Previous Password");
      return;
    }
    this.validatePrevious(stepper);
  }

  validatePrevious(stepper: any) {
    const pw = this.userDetailsGroup.get("password")?.value;
    const empId = this.authService.getEmployeeId();

    if (!pw || !empId) {
      this.isPrevPasswordValid = false;
      this.userDetailsGroup.get("password")?.markAsTouched();
      return;
    }

    this.checking = true;

    const payload = {
      employeeId: Number(empId),
      currentPassword: pw,
    };

    this.passwordService.validatePassword(payload).subscribe({
      next: (isValid: boolean) => {
        this.checking = false;

        if (isValid) {
          this.isPrevPasswordValid = true;
          stepper.next();
        } else {
          this.isPrevPasswordValid = false;
          this.userDetailsGroup.get("password")?.setErrors({ incorrect: true });
          this.userDetailsGroup.get("password")?.markAsTouched();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.checking = false;
        this.userDetailsGroup.get("password")?.setErrors({ incorrect: true });
      },
    });
  }

  onSubmit(stepper: MatStepper) {
    if (this.newPassGroup.invalid) {
      this.newPassGroup.markAllAsTouched();
      if (this.newPassGroup.hasError("sameAsOld")) {
        this.alertservice.showError(
          "New password cannot be same as previous password"
        );
      } else if (this.newPassGroup.hasError("mismatch")) {
        this.alertservice.showError("Passwords do not match");
      } else if (this.newPassGroup.hasError("passwordRequired")) {
        this.alertservice.showError("Please fill all password fields");
      }
      return;
    }
    const req = {
      email: this.employeeEmail,
      mobile: this.employeeMobile,
      password: this.userDetailsGroup.value.password,
      newPassword: this.newPassGroup.value.newPassword,
    };

    this.passwordService.changePassword(req).subscribe({
      next: () => {
        stepper.next();
      },
    });
  }

  onStepChange(event: any) {
    this.selectedStep = event.selectedIndex;
    if (event.previouslySelectedIndex === 1 && event.selectedIndex === 0) {
      this.newPassGroup.reset({
        newPassword: "",
        confirmPassword: "",
      });
    }
  }

  home(): void {
    this.router.navigate(["/mainlayout/dashboard"]);
  }
}
