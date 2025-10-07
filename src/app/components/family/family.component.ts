import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.css'],
})
export class FamilyComponent {
  familyForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.familyForm = this.formBuilder.group({
      fatherName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      fatherDOB: ['', [Validators.required, minimumAgeValidator(18)]],
      motherName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      motherDOB: ['', [Validators.required, minimumAgeValidator(18)]],
      spouseName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      spouseDOB: ['', [Validators.required, minimumAgeValidator(18)]],
      spouseGender: ['', Validators.required],
      children: ['', Validators.required],
    });

    this.userService.maritalStatus$.subscribe((status) => {
      console.log('Marital status changed:', status);
      const spouseName = this.familyForm.get('spouseName');
      const spouseDOB = this.familyForm.get('spouseDOB');
      const spouseGender = this.familyForm.get('spouseGender');
      const children = this.familyForm.get('children');

      if (status === 'married') {
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
    const savedData = this.userService.getFormData('family');
    if (savedData) {
      this.familyForm.patchValue(savedData);
    }

    const savedPersonalData = this.userService.getFormData('personal');
    if (savedPersonalData?.marital) {
      this.userService.setMaritalStatus(savedPersonalData.marital);
    }
  }

  back() {
    this.router.navigate(['/mainlayout/passport']);
  }

  submitForm() {
    if (this.familyForm.valid) {
      this.userService.setFormData('family', this.familyForm.value);
      this.router.navigate(['/mainlayout/previousEmployee']);
      console.log(this.familyForm.value);
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.familyForm.markAllAsTouched();
    }
  }
}
