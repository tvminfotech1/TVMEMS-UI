import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainlayoutService } from 'src/app/services/main-layout.service';

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
      : { minAge: { requiredAge: minAge, actualAge: age } };
  };
}

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css'],
})
export class PersonalComponent implements OnInit {
  current_countryValue: string = '';
  userForm!: FormGroup;
  currentAddressSubscription?: Subscription;
  copyAddressChecked: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
        private mainLayoutService: MainlayoutService

  ) {
    this.userForm = this.formBuilder.group({
      fname: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.pattern(/^[A-Za-z\s]+$/),
        ],
      ],
      mname: ['', [Validators.pattern(/^[A-Za-z\s]*$/)]],
      lname: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      dob: ['', [Validators.required, minimumAgeValidator(15)]],
      marital: ['', Validators.required],
      marriegedate: [''],
      current_address: ['', Validators.required],
      current_country: ['', Validators.required],
      current_state: ['', Validators.required],
      current_city: ['', Validators.required],
      current_pincode: [
        '',
        [Validators.required, Validators.pattern(/^\d{6}$/)],
      ],
      current_contact: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      permanent_country: ['', Validators.required],
      permanent_address: ['', Validators.required],
      permanent_state: ['', Validators.required],
      permanent_city: ['', Validators.required],
      permanent_pincode: [
        '',
        [Validators.required, Validators.pattern(/^\d{6}$/)],
      ],
      permanent_contact: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      bcp_address: ['', Validators.required],
      bcp_country: ['', Validators.required],
      bcp_state: ['', Validators.required],
      bcp_city: ['', Validators.required],
      bcp_pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      emergency_contact_name: ['', Validators.required],
      emergency_contact_number: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      emergency_relationship: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
      ],
      exp_year: ['', Validators.required],
      exp_month: ['', Validators.required],
      relevantYear: ['', Validators.required],
    });

    this.userForm.get('marital')?.valueChanges.subscribe((value) => {
      const marriageDateControl = this.userForm.get('marriegedate');
      this.userService.setMaritalStatus(value);
      if (value === 'married') {
        marriageDateControl?.setValidators([Validators.required]);
        marriageDateControl?.enable();
      } else {
        marriageDateControl?.clearValidators();
        marriageDateControl?.setValue('');
        marriageDateControl?.disable();
      }
      marriageDateControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const savedData = this.userService.getFormData('personal');
    if (savedData) {
      this.userForm.patchValue(savedData);
      this.copyAddressChecked = !!savedData.copyAddressChecked;

      if (this.copyAddressChecked) {
        this.disablePermanentFields();

        this.syncPermanentWithCurrent();
      }
    }

    this.userService.setFormGroup('personal', this.userForm);
  }

  copyCurrentToPermanent(event: MatCheckboxChange): void {
    this.copyAddressChecked = event.checked;

    if (event.checked) {
      this.userForm.patchValue({
        permanent_address: this.userForm.value.current_address,
        permanent_country: this.userForm.value.current_country,
        permanent_state: this.userForm.value.current_state,
        permanent_city: this.userForm.value.current_city,
        permanent_pincode: this.userForm.value.current_pincode,
        permanent_contact: this.userForm.value.current_contact,
      });

      this.disablePermanentFields();
      this.syncPermanentWithCurrent();
    } else {
      this.currentAddressSubscription?.unsubscribe();
      this.enablePermanentFields();
    }
  }

  disablePermanentFields() {
    [
      'permanent_address',
      'permanent_country',
      'permanent_state',
      'permanent_city',
      'permanent_pincode',
      'permanent_contact',
    ].forEach((field) => this.userForm.get(field)?.disable());
  }

  enablePermanentFields() {
    [
      'permanent_address',
      'permanent_country',
      'permanent_state',
      'permanent_city',
      'permanent_pincode',
      'permanent_contact',
    ].forEach((field) => this.userForm.get(field)?.enable());
  }

  syncPermanentWithCurrent() {
    this.currentAddressSubscription?.unsubscribe();

    this.currentAddressSubscription = this.userForm
      .get('current_address')
      ?.valueChanges.subscribe((value) => {
        this.userForm
          .get('permanent_address')
          ?.setValue(value, { emitEvent: false });
      });
    this.userForm.get('current_country')?.valueChanges.subscribe((value) => {
      this.userForm
        .get('permanent_country')
        ?.setValue(value, { emitEvent: false });
    });
    this.userForm.get('current_state')?.valueChanges.subscribe((value) => {
      this.userForm
        .get('permanent_state')
        ?.setValue(value, { emitEvent: false });
    });
    this.userForm.get('current_city')?.valueChanges.subscribe((value) => {
      this.userForm
        .get('permanent_city')
        ?.setValue(value, { emitEvent: false });
    });
    this.userForm.get('current_pincode')?.valueChanges.subscribe((value) => {
      this.userForm
        .get('permanent_pincode')
        ?.setValue(value, { emitEvent: false });
    });
    this.userForm.get('current_contact')?.valueChanges.subscribe((value) => {
      this.userForm
        .get('permanent_contact')
        ?.setValue(value, { emitEvent: false });
    });
  }

  submitForm() {
    if (this.userForm.valid) {
      const rawFormValue = this.userForm.getRawValue();

      const formValue = {
        ...rawFormValue,
        current_pincode: +rawFormValue.current_pincode,
        permanent_pincode: +rawFormValue.permanent_pincode,
        bcp_pincode: +rawFormValue.bcp_pincode,
        current_contact: +rawFormValue.current_contact,
        permanent_contact: +rawFormValue.permanent_contact,
        emergency_contact_number: +rawFormValue.emergency_contact_number,
        copyAddressChecked: this.copyAddressChecked,
      };

      console.log('Submitting data: ', formValue);
      this.userService.setFormData('personal', formValue);
      this.mainLayoutService.markTabCompleted('personal', true);
      this.router.navigate(['/mainlayout/kyc']);
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.userForm.markAllAsTouched();
    }
  }
}
