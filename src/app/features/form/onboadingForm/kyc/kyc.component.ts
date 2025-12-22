import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../../../core/services/user.service";
import { MainlayoutService } from "src/app/core/services/main-layout.service";
import { FormProgressService } from "src/app/core/services/form-progress.service";
import { AlertService } from "src/app/core/services/alert.service";
import { OnboardingPatchService } from "src/app/features/dashboard/my-profile/onboarding-patch.service";

@Component({
  selector: "app-kyc",
  templateUrl: "./kyc.component.html",
  styleUrls: ["./kyc.component.css"],
})
export class KycComponent implements OnInit {
  kycForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alertservie: AlertService,
    private mainlayoutService: MainlayoutService,
    private progressService: FormProgressService,
    private patchService: OnboardingPatchService
  ) {}

  ngOnInit(): void {
    this.kycForm = this.fb.group({
      pan: [
        "",
        [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      ],
      panName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      aadhar: ["", [Validators.required, Validators.pattern(/^\d{12}$/)]],
      aadharName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      uan: ["", [Validators.required, Validators.pattern(/^\d{12}$/)]],
      pf: [
        "",
        [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{17}$/)],
      ],
      hdfc: ["", Validators.required],
    });
    const savedData = this.userService.getFormData("kyc");
    if (savedData) {
      this.kycForm.patchValue(savedData);
    }
    const editMode = localStorage.getItem("editMode") === "true";
    const onboardingData = this.patchService.getOnboardingData();

    if (editMode && onboardingData && onboardingData.kyc) {
      this.kycForm.patchValue(onboardingData.kyc);
    }
    this.userService.setFormGroup("kyc", this.kycForm);
  }

  onPanInput(event: any) {
    this.kycForm.get("pan")?.setValue(event.target.value.toUpperCase());
  }

  back(): void {
    this.router.navigate(["/mainlayout/personal"]);
  }

  submitForm(): void {
    if (this.kycForm.valid) {
      this.userService.setFormData("kyc", this.kycForm.value);

      this.progressService.markStepComplete(2);
      this.mainlayoutService.markTabCompleted("kyc", true);
      this.router.navigate(["/mainlayout/passport"]);
    } else {
      this.alertservie.showError("Please fill all required fields");
      this.kycForm.markAllAsTouched();
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z ]$/.test(char)) {
      event.preventDefault();
    }
  }

  preventInvalidKeys(event: KeyboardEvent): void {
    if (["e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
    }
  }
}
