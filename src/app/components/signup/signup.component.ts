import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';
import { AlertService } from 'src/app/alert-service.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading: boolean = false;

  emailError: string = '';
  mobileError: string = '';
  successMessage: string = '';
  today: string = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder, 
    private authService: AuthService,
    private alertservice: AlertService) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[A-Za-z\s]+$/),
          ],
        ],
        lastName: [
          '',
          [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
        ],
        empId: ['', [Validators.required, Validators.pattern(/^[0-9]+$/),Validators.minLength(6), Validators.maxLength(6)]],
        mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),
          ],
        ],
        aadhar: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
        dob: ['', [Validators.required, this.dobValidator]],
        gender: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[A-Z][a-z]{2,}[#@\$&][0-9]{2,}$/),
          ],
        ],

        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
  this.signupForm.get('confirmPassword')?.updateValueAndValidity({ onlySelf: true });
});

this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
  this.signupForm.get('confirmPassword')?.updateValueAndValidity({ onlySelf: true });
});
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }


 passwordMatchValidator(group: FormGroup): null {
  const password = group.get('password');
  const confirmPassword = group.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  if (confirmPassword.value === '') {
    confirmPassword.setErrors({ required: true });
  } else if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
  } else {
    confirmPassword.setErrors(null);
  }

  return null;
}


  blockFullNameInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Delete',
      ' ',
    ];
    const pattern = /[A-Za-z]/;
    if (!pattern.test(event.key) && !allowedKeys.includes(event.key))
      event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 20) event.preventDefault();
  }

  validateEmpId(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Delete',
    ];

    if (allowedKeys.includes(event.key)) return;

    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) event.preventDefault();

    const input = event.target as HTMLInputElement;
    if (input.value.length >= 6) event.preventDefault();
  }

  blockMobileInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Delete',
    ];
    if (allowedKeys.includes(event.key)) return;
    const pattern = /[0-9]/;
    if (!allowedKeys.includes(event.key) && !pattern.test(event.key))
      event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 10) event.preventDefault();
  }

  blockAadharInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Delete',
    ];
    if (allowedKeys.includes(event.key)) return;
    const pattern = /[0-9]/;
    if (!allowedKeys.includes(event.key) && !pattern.test(event.key))
      event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 12) event.preventDefault();
  }

  dobValidator(control: any): { [key: string]: boolean } | null {
    if (!control.value) return null;
    const today = new Date();
    const dob = new Date(control.value);
    today.setHours(0, 0, 0, 0);
    dob.setHours(0, 0, 0, 0);
    return dob >= today ? { invalidDOB: true } : null;
  }

  onSubmit(): void {
    if (!this.signupForm.valid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.emailError = '';
    this.mobileError = '';
    this.successMessage = '';
    this.signupForm.get('email')?.setErrors(null);
    this.signupForm.get('mobile')?.setErrors(null);

    const formValue = this.signupForm.value;
    const fullName = `${formValue.firstName.trim()} ${formValue.lastName.trim()}`;
    const formattedDOB = new Date(formValue.dob).toISOString().slice(0, 13);

    const payload = {
      fullName,
      employeeId: Number(formValue.empId),
      mobile: Number(formValue.mobile),
      email: formValue.email,
      aadhar: formValue.aadhar,
      dob: formattedDOB,
      gender: formValue.gender,
      password: formValue.password,
      roles: ['string'],
    };
    this.loading=true;

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        this.successMessage =
          res.message || 'Registration successful! Please check your email.';
        this.alertservice.showSuccess(this.successMessage);
        this.signupForm.reset();
        this.signupForm.markAsPristine();
        this.signupForm.markAsUntouched();
        this.signupForm.updateValueAndValidity();
        Object.keys(this.signupForm.controls).forEach((key) => {
          this.signupForm.get(key)?.setErrors(null);
        });
      },
      error: (err) => {
        console.error('Signup error:', err);

        if (err.error) {
          const { mobileExists, emailExists } = err.error;

          if (mobileExists) {
            const mobileCtrl = this.signupForm.get('mobile');
            mobileCtrl?.setErrors({ duplicate: true });
            mobileCtrl?.markAsTouched();
            this.mobileError = 'Mobile number already exists';
          }

          if (emailExists) {
            const emailCtrl = this.signupForm.get('email');
            emailCtrl?.setErrors({ duplicate: true });
            emailCtrl?.markAsTouched();
            this.emailError = 'Email already exists';
          }
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  goBack() {
    this.signupForm.reset();
    this.signupForm.markAsPristine();
    this.signupForm.markAsUntouched();
    this.signupForm.updateValueAndValidity();
    Object.keys(this.signupForm.controls).forEach((key) => {
      this.signupForm.get(key)?.setErrors(null);
    });
  }
}
