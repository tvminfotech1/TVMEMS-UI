import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { UserService } from "../../../../core/services/user.service";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { FormProgressService } from "src/app/core/services/form-progress.service";
import { AuthService } from "src/app/core/services/auth.service";
import { AlertService } from "src/app/core/services/alert.service";

@Component({
  templateUrl: "./final.component.html",
  styleUrls: ["./final.component.css"],
})
export class FinalComponent {
  declarationForm: FormGroup;
  myForm!: FormGroup;
  currentDate: string = new Date().toISOString().substring(0, 10);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private progressService: FormProgressService,
    private authService: AuthService,
    private alertservice: AlertService
  ) {
    this.declarationForm = this.fb.group({
      checked: [false, Validators.requiredTrue],
      signature: this.fb.control("", {
        validators: [Validators.required, this.nameValidator],
        updateOn: "change",
      }),
      date: ["", Validators.required],
    });
  }
  back(): void {
    this.router.navigate(["/mainlayout/resume"]);
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) return null;

    const isTooShort = value.length < 3;
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[^a-zA-Z]/.test(value);

    if (hasNumber || hasSpecialChar) return { invalidChars: true };
    if (isTooShort) return { minLength: true };
    return null;
  }

  submitForm(): void {
    this.userService.setFormData("aFinal", this.declarationForm.value);
    this.progressService.markStepComplete(11);

    if (!this.userService.isAllFormsValid()) {
      const incompleteSteps = this.userService.getInvalidSteps();
      this.alertservice.showError(
        "Please complete these required steps: " + incompleteSteps.join(", ")
      );
      return;
    }

    forkJoin([
      this.userService.uploadDocuments(),
      this.userService.submitJsonData(),
    ]).subscribe({
      next: ([]) => {
        this.authService.setOnboardingCompleted();
        this.userService.clearFormData();
        this.router.navigate(["/mainlayout/thankYou"]);
      },
      error: (err) => {
        console.error("Submission error:", err);
        this.alertservice.showError("Something went wrong during submission.");
      },
    });
  }
}
