import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user-service.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainlayoutService } from 'src/app/services/main-layout.service';


@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
})
export class EducationComponent implements OnInit {
  educationList: any[] = [];
  educationForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private mainlayoutService: MainlayoutService
  ) {
    this.educationForm = this.formBuilder.group(
      {
        qualification: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^[A-Za-z. ]*$/),
          ],
        ],
        specilization: ['', Validators.required],
        instituteName: ['', Validators.required],
        universityName: ['', Validators.required],
        time: ['', Validators.required],
        fromDate: ['', Validators.required],
        toDate: ['', Validators.required],
        percentage: [
          '',
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        rollNo: ['', Validators.required],
        educationType: ['', Validators.required],
      },

      {
        validators: [this.dateRangeValidator('fromDate', 'toDate')],
      }
    );
  }

  preventInvalidInput(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  dateRangeValidator(fromKey: string, toKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const from = group.get(fromKey)?.value;
      const to = group.get(toKey)?.value;

      if (!from || !to) return null;

      const startDate = new Date(from);
      const endDate = new Date(to);

      if (startDate > endDate) {
        group.get(toKey)?.setErrors({ dateRange: true });
        return { dateRange: true };
      } else {
        if (group.get(toKey)?.hasError('dateRange')) {
          group.get(toKey)?.setErrors(null);
        }
      }

      return null;
    };
  }

  ngOnInit(): void {
    const savedData = this.userService.getFormData('education');
    if (savedData) {
      this.educationForm.patchValue(savedData);
    }
  }

  onPercentageInput(event: any): void {
    const value = parseFloat(event.target.value);

    if (isNaN(value)) return;

    if (value < 1) {
      event.target.value = 1;
      this.educationForm.get('percentage')?.setValue(1);
    } else if (value > 100) {
      event.target.value = 100;
      this.educationForm.get('percentage')?.setValue(100);
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z. ]$/.test(char)) {
      event.preventDefault();
    }
  }

  submitForm(): void {
    if (this.educationForm.valid) {
      this.educationList.push(this.educationForm.value);
      this.userService.setFormData('education', this.educationForm.value);
      this.router.navigate(['/mainlayout/skills']);
      this.mainlayoutService.markTabCompleted('education', true);
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.educationForm.markAllAsTouched();
    }
  }
}
