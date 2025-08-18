import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
})
export class DocumentComponent {
  documentForm!: FormGroup;
  fileErrors: Record<string, string> = {};

  private readonly MAX_FILE_SIZE_MB = 1;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
  private readonly ALLOWED_PDF_TYPE = 'application/pdf';

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
  }

  onFileChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.fileErrors[controlName] = ''; // reset error

    // Validate size
    const maxSizeInBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.fileErrors[controlName] = `File size must be less than ${this.MAX_FILE_SIZE_MB} MB`;
      input.value = '';
      this.documentForm.get(controlName)?.setValue(null);
      return;
    }

    // Validate type based on field
    let isValidType = true;
    if (['matric', 'intermediate', 'graduationMarksheet', 'postGraduation'].includes(controlName)) {
      // PDF expected
      if (file.type !== this.ALLOWED_PDF_TYPE) {
        isValidType = false;
      }
    } else {
      // Image expected
      if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        isValidType = false;
      }
    }

    if (!isValidType) {
      this.fileErrors[controlName] = `Invalid file type for ${controlName}`;
      input.value = '';
      this.documentForm.get(controlName)?.setValue(null);
      return;
    }

    // Valid file
    this.documentForm.get(controlName)?.setValue(file);
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

      // Get JWT token stored on login
      const token = localStorage.getItem('token'); 
      if (!token) {
        alert('User not authenticated. Please log in again.');
        return;
      }

      // Use userService method designed for KYC upload (no userId in URL)
      this.userService.uploadKycDocuments(formData).subscribe({
        next: (res) => {
          alert('Documents uploaded successfully!');
          this.router.navigate(['/mainlayout/resume']);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to upload documents.');
        }
      });
    } else {
      this.documentForm.markAllAsTouched();
      alert('Please fill all required documents.');
    }
  }
}
