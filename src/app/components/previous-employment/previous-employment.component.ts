import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { AbstractControl, ValidatorFn } from '@angular/forms';

function startDateValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate >= today) {
      return { invalidStartDate: true };
    }
    return null;
  };
}

function endDateValidator(startDateControlName: string): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.parent) return null;

    const startDateValue = control.parent.get(startDateControlName)?.value;
    const endDateValue = control.value;

    if (!startDateValue || !endDateValue) return null;

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (endDate <= startDate) {
      return { invalidEndDate: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-previous-employment',
  templateUrl: './previous-employment.component.html',
  styleUrls: ['./previous-employment.component.css'],
})
export class PreviousEmploymentComponent implements OnInit {
  showPopup = false;
  employmentForm!: FormGroup;
  employmentList: any[] = [];
  maxStartDate!: Date;

  get minEndDate(): Date | null {
    const sd = this.employmentForm.get('startDate')?.value;
    if (!sd) return null;
    const d = new Date(sd);
    d.setDate(d.getDate() + 1);
    return d;
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.maxStartDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    this.employmentForm = this.fb.group({
      companyName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9\s.,&'-]+$/),
        ],
      ],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      startDate: ['', [Validators.required, startDateValidator()]],
      endDate: ['', [Validators.required, endDateValidator('startDate')]],
    });

    this.employmentForm.get('startDate')?.valueChanges.subscribe(() => {
      this.employmentForm.get('endDate')?.updateValueAndValidity();
    });

    const savedData = this.userService.getFormData('previousEmployment');
    if (savedData) {
      this.employmentList = savedData;
    }
  }

  isDateDisabled = (date: Date): boolean => {
    if (!date) return false;

    return this.employmentList.some((emp) => {
      const start = new Date(emp.startDate);
      const end = new Date(emp.endDate);

      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      return normalizedDate >= start && normalizedDate <= end;
    });
  };

  startDateFilter = (d: Date | null): boolean => {
    if (!d) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d >= today) return false;

    return !this.isDateDisabled(d);
  };

  endDateFilter = (d: Date | null): boolean => {
    if (!d) return true;

    const startDateValue = this.employmentForm.get('startDate')?.value;
    if (!startDateValue) return true;

    const startDate = new Date(startDateValue);
    startDate.setHours(0, 0, 0, 0);

    if (d <= startDate) return false;

    return !this.isDateDisabled(d);
  };

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.employmentForm.reset();
  }

  saveEmployment(): void {
    if (this.employmentForm.valid) {
      this.employmentList.push(this.employmentForm.value);
      this.userService.setFormData('previousEmployment', this.employmentList);
      this.closePopup();
    } else {
      this.employmentForm.markAllAsTouched();
    }
  }

  formatDesignation(value: string): string {
    if (!value) return '';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  back(): void {
    this.router.navigate(['/mainlayout/family']);
  }

  deleteEmployment(index: number): void {
    this.employmentList.splice(index, 1);
  }

  finalSave(): void {
    if (this.employmentList.length > 0) {
      this.userService.setFormData('previousEmployment', this.employmentList);
      console.log('pre emp: ', this.employmentList);
      this.router.navigate(['/mainlayout/education']);
    } else {
      this.userService.setFormData('previousEmployment', this.employmentList);
      console.log('no emp: ', this.employmentList);
      this.router.navigate(['/mainlayout/education']);
    }
  }
}
