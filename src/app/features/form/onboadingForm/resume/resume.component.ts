import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../../../core/services/user.service";
import { MainlayoutService } from "src/app/core/services/main-layout.service";
import { FormProgressService } from "src/app/core/services/form-progress.service";
import { AlertService } from "src/app/core/services/alert.service";
import { OnboardingPatchService } from "src/app/core/services/onboarding-patch.service";

@Component({
  selector: "app-resume",
  templateUrl: "./resume.component.html",
  styleUrls: ["./resume.component.css"],
})
export class ResumeComponent implements OnInit {
  resumeForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private alertservice: AlertService,
    private mainlayoutService: MainlayoutService,
    private progressService: FormProgressService,
    private patchService: OnboardingPatchService
  ) {}

  ngOnInit(): void {
    this.resumeForm = this.formBuilder.group({
      achievements: ["", Validators.required],
      resumeCate: ["", Validators.required],
    });

    const savedData = this.userService.getFormData("resume");
    if (savedData) {
      this.resumeForm.patchValue(savedData);
    }
    const editMode = sessionStorage.getItem("editMode") === "true";
    const onboardingData = this.patchService.getOnboardingData();

    if (editMode && onboardingData?.resume) {
      this.resumeForm.patchValue({
        achievements: onboardingData.resume.achievements,
        resumeCate: onboardingData.resume.resumeCate,
      });

      this.userService.setFormData("resume", onboardingData.resume);
    }
  }

  back() {
    this.router.navigate(["/mainlayout/document"]);
  }

  submitForm() {
    if (this.resumeForm.valid) {
      this.userService.setFormData("resume", this.resumeForm.value);
      this.progressService.markStepComplete(10);
      this.mainlayoutService.markTabCompleted("resume", true);
      this.router.navigate(["/mainlayout/final"]);
    } else {
      this.alertservice.showError("Please fill all required fields");
      this.resumeForm.markAllAsTouched();
    }
  }
}
