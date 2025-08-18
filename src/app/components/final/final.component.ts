import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './final.component.html',
  styleUrls: ['./final.component.css'],
})
export class FinalComponent {
  declarationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.declarationForm = this.fb.group({
      checked: [false, Validators.requiredTrue],
      signature: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  submitForm(): void {
    if (this.declarationForm.valid) {
      if (!this.userService.isAllFormsValid()) {
        const incompleteSteps = this.userService.getInvalidSteps();
        alert('Please complete the following steps: ' + incompleteSteps.join(', '));
        return;
      }

      this.userService.setFormData('aFinal', this.declarationForm.value);

      const allData = {
        ...this.userService.getFormData('personal'),
        kyc: this.userService.getFormData('kyc'),
        passport: this.userService.getFormData('passport'),
        family: this.userService.getFormData('family'),
        previousEmployment: this.userService.getFormData('previousEmployment'),
        education: this.userService.getFormData('education'),
        skills: this.userService.getFormData('skills'),
        certification: this.userService.getFormData('certification'),
        documents: this.userService.getFormData('documents'),
        resume: this.userService.getFormData('resume'),
        aFinal: this.userService.getFormData('aFinal'),
      };

      const finalFormData = new FormData();
      finalFormData.append(
        'jsonData',
        new Blob([JSON.stringify(allData)], { type: 'application/json' })
      );

      const uploadedFiles = this.userService.getFormData('uploadedFiles') as FormData;
      if (uploadedFiles) {
        uploadedFiles.forEach((value, key) => {
          finalFormData.append(key, value);
        });
      }

      this.userService.submitFinalData(finalFormData).subscribe({
        next: (res: any) => {
          console.log('Server response:', res);
          this.router.navigate(['/mainlayout/thankYou']);
        },
        error: (err) => {
          console.error('Submission error:', err);
          alert('Something went wrong while submitting the form.');
        }
      });

    } else {
      this.declarationForm.markAllAsTouched();
    }
  }
}
