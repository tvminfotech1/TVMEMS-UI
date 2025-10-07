import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-passport-visa',
  templateUrl: './passport-visa.component.html',
  styleUrls: ['./passport-visa.component.css'],
})
export class PassportVisaComponent implements OnInit {
  passportValue: string = '';
  userForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      nationality: ['', Validators.required],
      ifPassport: ['', Validators.required],
      passportNumber: [''],
    });
    const savedData = this.userService.getFormData('passport');
    if (savedData) {
      this.userForm.patchValue(savedData);
    }

    this.userForm.get('ifPassport')?.valueChanges.subscribe((value) => {
      const passportControl = this.userForm.get('passportNumber');
      if (value === 'Yes') {
        passportControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9]*$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]);
      } else {
        passportControl?.clearValidators();
        passportControl?.setValue('');
      }
      passportControl?.updateValueAndValidity();
    });
  }

  back() {
    this.router.navigate(['/mainlayout/kyc']);
  }

  submitForm() {
    if (this.userForm.valid) {
      this.userService.setFormData('passport', this.userForm.value);
      this.router.navigate(['/mainlayout/family']);
      console.log(this.userForm.value);
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
