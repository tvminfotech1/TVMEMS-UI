import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../../core/services/user.service";
import { Router } from "@angular/router";
import { MainlayoutService } from "src/app/core/services/main-layout.service";
import { FormProgressService } from "src/app/core/services/form-progress.service";
import { AlertService } from "src/app/core/services/alert.service";
import { OnboardingPatchService } from "src/app/core/services/onboarding-patch.service";

@Component({
  selector: "app-passport-visa",
  templateUrl: "./passport-visa.component.html",
  styleUrls: ["./passport-visa.component.css"],
})
export class PassportVisaComponent implements OnInit {
  passportValue: string = "";
  userForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alertservice: AlertService,
    private mainlayoutService: MainlayoutService,
    private progressService: FormProgressService,
    private patchService: OnboardingPatchService
  ) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      nationality: ["", Validators.required],
      ifPassport: ["", Validators.required],
      passportNumber: [""],
    });
    const savedData = this.userService.getFormData("passport");
    if (savedData) {
      this.userForm.patchValue(savedData);
    }
    const editMode = sessionStorage.getItem("editMode") === "true";
    const onboardingData = this.patchService.getOnboardingData();

    if (editMode && onboardingData && onboardingData.passport) {
      this.patchService.patchSection(this.userForm, onboardingData.passport);

      if (onboardingData.passport.ifPassport === "Yes") {
        this.userForm
          .get("passportNumber")
          ?.setValidators([
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9]*$/),
            Validators.minLength(8),
            Validators.maxLength(8),
          ]);
        this.userForm.get("passportNumber")?.updateValueAndValidity();
      }
    }

    this.userForm.get("ifPassport")?.valueChanges.subscribe((value) => {
      const passportControl = this.userForm.get("passportNumber");
      if (value === "Yes") {
        passportControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9]*$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]);
      } else {
        passportControl?.clearValidators();
        passportControl?.setValue("");
      }
      passportControl?.updateValueAndValidity();
    });
  }

  back() {
    this.router.navigate(["/mainlayout/kyc"]);
  }

  submitForm() {
    if (this.userForm.valid) {
      this.userService.setFormData("passport", this.userForm.value);
      this.progressService.markStepComplete(3);

      this.mainlayoutService.markTabCompleted("passport", true);
      this.router.navigate(["/mainlayout/family"]);
    } else {
      this.alertservice.showError("Please fill all required fields");
      this.userForm.markAllAsTouched();
    }
  }
}
