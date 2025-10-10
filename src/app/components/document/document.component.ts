import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainlayoutService } from 'src/app/services/main-layout.service';


export function fileRequired(
  control: AbstractControl
): ValidationErrors | null {
  return control.value ? null : { required: true };
}

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
})
export class DocumentComponent {
  documentForm!: FormGroup;
  fileErrors: Record<string, string> = {};

  private readonly MAX_FILE_SIZE_MB = 1;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private mainlayoutService: MainlayoutService
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

  ngOnInit() {
    const savedFiles = this.userService.getFormData('documents');
    if (savedFiles) {
      Object.keys(savedFiles).forEach((key) => {
        const file = savedFiles[key];
        if (file) {
          this.documentForm.get(key)?.setValue(file);
        }
      });
    }
  }
previewUrls: any = {}; // store active preview URLs

viewFile(field: string): void {
  const file = this.documentForm.get(field)?.value;
  if (file && file.type.startsWith('image/')) {
    this.previewUrls[field] = URL.createObjectURL(file);
  }
}
viewPdf(field: string): void {
  const file = this.documentForm.get(field)?.value;
  if (file && file.type === 'application/pdf') {
    this.previewUrls[field] = URL.createObjectURL(file);
  }
}

closePreview(field: string): void {
  this.previewUrls[field] = null;
}



  private getAllowedTypes(controlName: string): string[] {
    const pdfFields = [
      'matric',
      'intermediate',
      'graduationMarksheet',
      'postGraduation',
    ];
    return pdfFields.includes(controlName)
      ? ['application/pdf']
      : ['image/jpeg', 'image/png'];
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
      this.fileErrors[controlName] = '';
      return;
    }

    const file = input.files[0];
    this.fileErrors[controlName] = '';

    if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.fileErrors[
        controlName
      ] = `File size must be less than ${this.MAX_FILE_SIZE_MB} MB`;
      control?.setValue(null);
      input.value = '';
      return;
    }

    const pdfFields = [
      'matric',
      'intermediate',
      'graduationMarksheet',
      'postGraduation',
    ];
    const allowedTypes = pdfFields.includes(controlName)
      ? ['application/pdf']
      : ['image/jpg', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      const types = allowedTypes
        .map((t) => (t === 'application/pdf' ? 'pdf' : t.split('/')[1]))
        .join(', ');
      this.fileErrors[controlName] = `Invalid file type. Allowed: ${types}`;
      control?.setValue(null);
      input.value = '';
      return;
    }

    control?.setValue(file);
    control?.markAsTouched();
  }

  back() {
    this.router.navigate(['/mainlayout/certificate']);
  }

  submitForm() {
    if (this.documentForm.valid) {
      const files: Record<string, File> = {};
      Object.keys(this.documentForm.controls).forEach((key) => {
        const file = this.documentForm.get(key)?.value;
        if (file) files[key] = file;
      });

      this.userService.setFormData('documents', files);
      console.log(
        'All form data in service:',
        this.userService.getAllFormData()
      );
      console.log('All form data in servicePurushoth:', this.userService.getFormData('documents'));

      this.router.navigate(['/mainlayout/resume']);
      this.mainlayoutService.markTabCompleted('document', true);
    } else {
      this.snackBar.open('Please upload all the documents', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.documentForm.markAllAsTouched();
    }
  }
}
