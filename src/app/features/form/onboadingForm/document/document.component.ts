import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { UserService } from "../../../../core/services/user.service";
import { Router } from "@angular/router";
import { MainlayoutService } from "src/app/core/services/main-layout.service";
import { FormProgressService } from "src/app/core/services/form-progress.service";
import { AlertService } from "src/app/core/services/alert.service";
import { OnboardingPatchService } from "src/app/features/dashboard/my-profile/onboarding-patch.service";
import { MyProfileService } from "src/app/core/services/my-profile.service";

export function fileRequired(
  control: AbstractControl
): ValidationErrors | null {
  return control.value ? null : { required: true };
}

@Component({
  selector: "app-document",
  templateUrl: "./document.component.html",
  styleUrls: ["./document.component.css"],
})
export class DocumentComponent {
  documentForm!: FormGroup;
  fileErrors: Record<string, string> = {};

  private readonly MAX_FILE_SIZE_MB = 1;

  isPgDocEnabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private alertservice: AlertService,
    private router: Router,
    private mainlayoutService: MainlayoutService,
    private progressService: FormProgressService,
    private patchService: OnboardingPatchService,
    private profileService: MyProfileService
  ) {
    this.documentForm = this.fb.group({
      panCard: [null, fileRequired],
      aadharCard: [null, fileRequired],
      pSizePhoto: [null, fileRequired],
      matric: [null, fileRequired],
      intermediate: [null, fileRequired],
      graduationMarksheet: [null, fileRequired],
      postGraduation: [null, fileRequired],
      checkLeaf: [null, fileRequired],
      passbook: [null, fileRequired],
    });
  }
  patchExistingDocuments(employeeId: number, docFlags: any) {
    const docMap: any = {
      panCard: "pancard",
      aadharCard: "aadharcard",
      pSizePhoto: "psizephoto",
      matric: "matric",
      intermediate: "intermediate",
      graduationMarksheet: "graduationmarksheet",
      postGraduation: "postgraduation",
      checkLeaf: "checkleaf",
      passbook: "passbook",
    };

    Object.keys(docFlags).forEach((docKey) => {
      if (docFlags[docKey] === true) {
        const apiDocType = docMap[docKey];

        this.profileService
          .viewDocument(employeeId, apiDocType)
          .subscribe((base64) => {
            if (base64) {
              const fileName =
                apiDocType +
                (apiDocType === "matric" ||
                apiDocType === "intermediate" ||
                apiDocType === "graduationmarksheet" ||
                apiDocType === "postgraduation"
                  ? ".pdf"
                  : ".jpg");

              const file = this.base64ToFile(base64, fileName);

              this.documentForm.patchValue({
                [docKey]: file,
              });

              this.userService.setDocumentOne(docKey, file);
            }
          });
      }
    });
  }

  base64ToFile(base64: string, filename: string): File {
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }

    const mimeType = filename.endsWith(".pdf")
      ? "application/pdf"
      : "image/jpeg";

    return new File([arrayBuffer], filename, { type: mimeType });
  }

  ngOnInit() {
    const savedFiles = this.userService.getFormData("documents");
    if (savedFiles) {
      Object.keys(savedFiles).forEach((key) => {
        const file = savedFiles[key];
        if (file) {
          this.documentForm.get(key)?.setValue(file);
        }
      });
    }
    const editMode = sessionStorage.getItem("editMode") === "true";
    const onboardingData = this.patchService.getOnboardingData();

    const employeeId = onboardingData?.user?.employeeId;

    if (onboardingData?.documents) {
      const fixedDocFlags = {
        panCard: onboardingData.documents.panCard,
        aadharCard: onboardingData.documents.aadharCard,
        pSizePhoto: onboardingData.documents.psizePhoto,
        matric: onboardingData.documents.matric,
        intermediate: onboardingData.documents.intermediate,
        graduationMarksheet: onboardingData.documents.graduationMarksheet,
        postGraduation: onboardingData.documents.postGraduation,
        checkLeaf: onboardingData.documents.checkLeaf,
        passbook: onboardingData.documents.passbook,
      };

      this.patchExistingDocuments(employeeId, fixedDocFlags);
    }

    this.userService.educationType$.subscribe((type) => {
      this.isPgDocEnabled = type === "postgraduate" || type === "phd";

      if (!this.isPgDocEnabled) {
        this.documentForm.get("postGraduation")?.reset();
        this.documentForm.get("postGraduation")?.disable();
        this.documentForm.get("postGraduation")?.setValue(null);
      } else {
        this.documentForm.get("postGraduation")?.enable();
      }
    });
  }

  triggerFileInput(input: HTMLInputElement) {
    input.click();
  }

  onFileChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const control = this.documentForm.get(controlName);

    if (!input.files || input.files.length === 0) {
      control?.markAsTouched();
      control?.setValue(null);
      this.fileErrors[controlName] = "";
      return;
    }

    const file = input.files[0];
    this.fileErrors[controlName] = "";

    if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.fileErrors[
        controlName
      ] = `File size must be less than ${this.MAX_FILE_SIZE_MB} MB`;
      control?.setValue(null);
      input.value = "";
      return;
    }

    const pdfFields = [
      "matric",
      "intermediate",
      "graduationMarksheet",
      "postGraduation",
    ];
    const allowedTypes = pdfFields.includes(controlName)
      ? ["application/pdf"]
      : ["image/jpg", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      const types = allowedTypes
        .map((t) => (t === "application/pdf" ? "pdf" : t.split("/")[1]))
        .join(", ");
      this.fileErrors[controlName] = `Invalid file type. Allowed: ${types}`;
      control?.setValue(null);
      input.value = "";
      return;
    }

    control?.setValue(file);
    control?.markAsTouched();
  }

  back() {
    this.router.navigate(["/mainlayout/certificate"]);
  }

  submitForm() {
    if (this.documentForm.valid) {
      const formData = new FormData();
      Object.keys(this.documentForm.controls).forEach((key) => {
        const file = this.documentForm.get(key)?.value;
        if (file) {
          formData.append(key, file);
        }
      });
      this.userService.setUploadDoc("documents", formData);
      this.progressService.markStepComplete(9);

      this.mainlayoutService.markTabCompleted("document", true);
      this.router.navigate(["/mainlayout/resume"]);
    } else {
      this.alertservice.showError("Please upload all the documents");
      this.documentForm.markAllAsTouched();
    }
  }
}
