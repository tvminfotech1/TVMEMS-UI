import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { AuthService } from "src/app/core/services/auth.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { UserDetailsService } from "src/app/core/services/userDetails.service";
import { MyProfileService } from "src/app/core/services/my-profile.service";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { OnboardingPatchService } from "../../../core/services/onboarding-patch.service";
import { MatStepper } from "@angular/material/stepper";

@Component({
  selector: "app-my-profile",
  templateUrl: "./my-profile.component.html",
  styleUrls: ["./my-profile.component.css"],
})
export class MyProfileComponent implements OnInit {
  userData: any = {};
  employeeId: number | null = null;
  email: string | null = null;
  fullName: string | null = null;
  userDetails!: FormGroup;
  profileImageUrl: string = "assets/images/profile.jpg";
  onboarding: any;
  isLoaded = false;
  @ViewChild("documentPopup") documentPopup!: TemplateRef<any>;
  popupData: any = {};
  @ViewChild(MatStepper) stepper!: MatStepper;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private userDetailsService: UserDetailsService,
    private myprofileService: MyProfileService,
    private location: Location,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router,
    private patchService: OnboardingPatchService
  ) {}

  ngOnInit(): void {
    this.employeeId = this.getEmployeeIdFromToken();
    this.email = this.authService.getEmailFromToken();
    this.fullName = this.authService.getfullName()?.toUpperCase() || null;
    this.loadProfilePhoto();
    this.loadOnboardingData();
  }

  loadOnboardingData() {
    this.myprofileService.getOnboardingDetails(this.employeeId!).subscribe({
      next: (res) => {
        this.onboarding = res;
        this.isLoaded = true;
      },
      error: (err) => console.error(err),
    });
  }

  close(): void {
    this.location.back();
  }

  getEmployeeIdFromToken(): number | null {
    const empIdStr = this.authService.getEmployeeId();
    return empIdStr ? Number(empIdStr) : null;
  }

  loadProfilePhoto() {
    this.myprofileService.getUserPhoto(this.employeeId!).subscribe({
      next: (photoUrl: string) => {
        if (photoUrl) {
          this.profileImageUrl = photoUrl;
        }
      },
      error: (err: any) => {
        console.error("Error loading profile photo:", err.error);
      },
    });
  }

  viewDocument(type: string) {
    this.myprofileService.viewDocument(this.employeeId!, type).subscribe({
      next: (base64: string) => {
        if (base64 === "NO_FILE") {
          alert("No file uploaded for this document.");
          return;
        }

        let fileType = "image";
        if (
          type === "matric" ||
          type === "intermediate" ||
          type === "graduationmarksheet" ||
          type === "postgraduation"
        ) {
          fileType = "pdf";
        }

        let safeUrl: SafeResourceUrl | null = null;

        if (fileType === "pdf") {
          safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:application/pdf;base64,${base64}`
          );
        }

        this.dialog.open(this.documentPopup, {
          width: "800px",
          maxHeight: "90vh",
          data: {
            base64,
            fileType,
            safeUrl,
          },
        });
      },
      error: (err) => {
        console.error(err);
        alert("Unable to load document");
      },
    });
  }

  editOnboarding() {
    this.patchService.setOnboardingData(this.onboarding);
    sessionStorage.setItem("editMode", "true");
    this.router.navigate(["/mainlayout/personal"]);
  }
  goBack() {
    this.stepper.selectedIndex = 0;
  }

  goNext(stepper: any) {
    stepper.next();
  }

  goPrevious(stepper: any) {
    stepper.previous();
  }
}
