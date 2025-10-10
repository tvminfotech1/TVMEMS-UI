import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './final.component.html',
  styleUrls: ['./final.component.css'],
})
export class FinalComponent {
  declarationForm: FormGroup;
  myForm!: FormGroup;
  currentDate: string = new Date().toISOString().substring(0, 10);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.declarationForm = this.fb.group({
      checked: [false, Validators.requiredTrue],
      signature: this.fb.control('', {
        validators: [Validators.required, this.nameValidator],
        updateOn: 'change',
      }),
      date: ['', Validators.required],
    });
  }
  back(): void {
    this.router.navigate(['/mainlayout/resume']);
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) return null;

    const isTooShort = value.length < 3;
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[^a-zA-Z]/.test(value);

    if (hasNumber || hasSpecialChar) return { invalidChars: true };
    if (isTooShort) return { minLength: true };
    return null;
  }

  submitForm(): void {
    if (this.declarationForm.valid) {
      this.userService.setFormData('final', this.declarationForm.value);
            console.log("this is failed formData1",this.userService.getAllFormData());

      if (!this.userService.isAllFormsValid()) {
        const incompleteSteps = this.userService.getInvalidSteps();
              console.log("this is failed formData2",this.userService.getAllFormData());
        alert(
          'Please complete these required steps: ' + incompleteSteps.join(', ')
        );
        return;
      }
      
      this.userService.submitFinalData().subscribe({
        next: (res) => {
          console.log('Submission success:', res);
          this.userService.clearFormData();
          this.router.navigate(['/mainlayout/thankYou']);
        },
        error: (err) => {
          console.error('Submission error:', err);
          alert('Something went wrong during submission.');
        },
      });      
    } else {
      console.log("this is failed formData3",this.userService.getAllFormData());
      console.log('Form is invalid', this.declarationForm.value);
      this.declarationForm.markAllAsTouched();
    }
  }
}
