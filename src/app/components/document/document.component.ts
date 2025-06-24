import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../user-service.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-document",
  templateUrl: "./document.component.html",
  styleUrls: ["./document.component.css"],
})
export class DocumentComponent {
  fileErrors: { [key: string]: string } = {};
  documentForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.documentForm = this.fb.group({
      panCard: [null, Validators.required],
      aadharCard: [null, Validators.required],
      pSizePhoto: [null, Validators.required],
      matric: [null, Validators.required],
      intermediate: [null, Validators.required],
      graduationMarksheet: [null, Validators.required],
      postGraduation: [null, Validators.required],
      checkLeaf: [null, Validators.required],
      passbook: [null, Validators.required],
    });

    // Store FormGroup to userService for validation checks later
    this.userService.setFormGroup("education", this.documentForm);
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      const maxSizeInMB = 1;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.fileErrors[controlName] = "File size must be less than 1 MB";

        // Clear file input to avoid invalid state
        event.target.value = "";
        this.documentForm.get(controlName)?.setValue(null);

        return;
      } else {
        this.fileErrors[controlName] = "";
        this.documentForm.get(controlName)?.setValue(file);
      }
    }
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
      this.userService.setFormData("DocumentDetails", this.documentForm.value);
      this.router.navigate(["/mainlayout/resume"]);
    } else {
      this.documentForm.markAllAsTouched();
      alert("Please fill all required documents.");
    }
  }
}
