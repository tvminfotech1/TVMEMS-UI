import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../../../core/services/user.service";
import { MainlayoutService } from "src/app/core/services/main-layout.service";
import { FormProgressService } from "src/app/core/services/form-progress.service";
import { AlertService } from "src/app/core/services/alert.service";
import { OnboardingPatchService } from "src/app/core/services/onboarding-patch.service";

@Component({
  selector: "app-skills",
  templateUrl: "./skills.component.html",
  styleUrls: ["./skills.component.css"],
})
export class SkillsComponent implements OnInit {
  skillForm!: FormGroup;
  skillList: any[] = [];
  showPopup = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private mainlayoutService: MainlayoutService,
    private alertService: AlertService,
    private progressService: FormProgressService,
    private patchService: OnboardingPatchService
  ) {
    this.skillForm = this.formBuilder.group({
      skillName: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s.,&'-]+$/),
          Validators.minLength(3),
        ],
      ],
      skillCategories: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s.,&'-]+$/),
          Validators.minLength(3),
        ],
      ],
      versionNum: [
        "",
        [Validators.required, Validators.pattern("^[0-9]+(\\.[0-9]+)?$")],
      ],
      experience_year: [
        "",
        [
          Validators.required,
          Validators.pattern("^[0-9]+$"),
          Validators.min(1),
          Validators.max(15),
        ],
      ],
      experience_month: [
        "",
        [
          Validators.required,
          Validators.pattern("^[0-9]+$"),
          Validators.max(11),
        ],
      ],
      selfRate: ["", [Validators.required]],
    });

    this.userService.setFormGroup("skills", this.skillForm);
  }

  ngOnInit(): void {
    const savedSkills = this.userService.getFormData("skills");
    if (savedSkills && Array.isArray(savedSkills)) {
      this.skillList = savedSkills;
    }
    const editMode = sessionStorage.getItem("editMode") === "true";
    const onboardingData = this.patchService.getOnboardingData();

    if (editMode && onboardingData?.skills?.length > 0) {
      this.skillList = onboardingData.skills.map((s: any) => ({
        skillName: s.skillName,
        skillCategories: s.skillCategories,
        versionNum: s.versionNum,
        experience_year: s.experience_year,
        experience_month: s.experience_month,
        selfRate: s.selfRate,
      }));

      this.userService.setFormData("skills", this.skillList);
    }
  }

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  addSkill(): void {
    if (this.skillForm.valid) {
      this.skillList.push(this.skillForm.value);
      this.userService.setFormData("skills", this.skillList);
      this.skillForm.reset({
        skillName: "",
        skillCategories: "",
        versionNum: "",
        experience_year: null,
        experience_month: null,
        selfRate: null,
      });
      this.showPopup = false;
    } else {
      this.skillForm.markAllAsTouched();
    }
  }

  deleteSkill(index: number): void {
    this.skillList.splice(index, 1);
  }

  finalSubmit(): void {
    if (this.skillList.length >= 1) {
      this.userService.setFormData("skills", this.skillList);
      this.mainlayoutService.markTabCompleted("skills", true);
      this.progressService.markStepComplete(7);
      this.router.navigate(["/mainlayout/certificate"]);
    } else {
      this.alertService.showWarning("Minimum 1 skills is required");
    }
  }

  preventInvalidInput(event: KeyboardEvent) {
    if (["e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  }

  previous() {
    this.router.navigate(["/mainlayout/education"]);
  }
}
