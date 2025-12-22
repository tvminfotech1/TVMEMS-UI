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
import { MainlayoutService } from "src/app/core/services/main-layout.service";
import { FormProgressService } from "src/app/core/services/form-progress.service";
import { AlertService } from "src/app/core/services/alert.service";
import { OnboardingPatchService } from "src/app/features/dashboard/my-profile/onboarding-patch.service";

export function minimumAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const dob = new Date(control.value);
    if (isNaN(dob.getTime())) return { invalidDate: true };

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age >= minAge
      ? null
      : { minimumAgeValidator: { requiredAge: minAge, actualAge: age } };
  };
}

@Component({
  selector: "app-family",
  templateUrl: "./family.component.html",
  styleUrls: ["./family.component.css"],
})
export class FamilyComponent {
  familyForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alertservice: AlertService,
    private mainlayoutService: MainlayoutService,
    private progressService: FormProgressService,
    private patchService: OnboardingPatchService
  ) {
    this.familyForm = this.formBuilder.group({
      fatherName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      fatherDOB: ["", [Validators.required, minimumAgeValidator(18)]],
      motherName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      motherDOB: ["", [Validators.required, minimumAgeValidator(18)]],
      spouseName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      spouseDOB: ["", [Validators.required, minimumAgeValidator(18)]],
      spouseGender: ["", Validators.required],
      children: ["", Validators.required],
    });

    this.userService.maritalStatus$.subscribe((status) => {
      const spouseName = this.familyForm.get("spouseName");
      const spouseDOB = this.familyForm.get("spouseDOB");
      const spouseGender = this.familyForm.get("spouseGender");
      const children = this.familyForm.get("children");

      if (status === "married") {
        spouseName?.enable();
        spouseDOB?.enable();
        spouseGender?.enable();
        children?.enable();

        spouseName?.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ]);
        spouseDOB?.setValidators([
          Validators.required,
          minimumAgeValidator(18),
        ]);
        spouseGender?.setValidators([Validators.required]);
        children?.setValidators([Validators.required]);
      } else {
        spouseName?.reset();
        spouseDOB?.reset();
        spouseGender?.reset();
        children?.reset();

        spouseName?.disable();
        spouseDOB?.disable();
        spouseGender?.disable();
        children?.disable();

        spouseName?.clearValidators();
        spouseDOB?.clearValidators();
        spouseGender?.clearValidators();
        children?.clearValidators();
      }

      spouseName?.updateValueAndValidity();
      spouseDOB?.updateValueAndValidity();
      spouseGender?.updateValueAndValidity();
      children?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const savedData = this.userService.getFormData("family");
    if (savedData) {
      this.familyForm.patchValue(savedData);
    }

    const savedPersonalData = this.userService.getFormData("personal");
    if (savedPersonalData?.marital) {
      this.userService.setMaritalStatus(savedPersonalData.marital);
    }
    const editMode = sessionStorage.getItem("editMode") === "true";
    const onboardingData = this.patchService.getOnboardingData();

    if (editMode && onboardingData?.family) {
      this.patchService.patchSection(this.familyForm, onboardingData.family);

      const maritalStatus = onboardingData.personal?.marital;

      if (maritalStatus === "married") {
        this.userService.setMaritalStatus("married");
      } else {
        this.userService.setMaritalStatus("single");

        this.familyForm.patchValue({
          spouseName: "",
          spouseDOB: "",
          spouseGender: "",
          children: "",
        });
      }
    }
  }

  back() {
    this.router.navigate(["/mainlayout/passport"]);
  }

  submitForm() {
    if (this.familyForm.valid) {
      const fullFamilyData = this.familyForm.getRawValue();
      this.userService.setFormData("family", fullFamilyData);

      this.progressService.markStepComplete(4);

      this.mainlayoutService.markTabCompleted("family", true);
      this.router.navigate(["/mainlayout/previousEmployee"]);
    } else {
      this.alertservice.showError("Please fill all required fields");
      this.familyForm.markAllAsTouched();
    }
  }
}
