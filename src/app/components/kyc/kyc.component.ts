import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.css'],
})
export class KycComponent implements OnInit {
  kycForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.kycForm = this.fb.group({
      pan: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      ],
      panName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      aadhar: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      aadharName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/),
        ],
      ],
      uan: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      pf: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{17}$/)],
      ],
      hdfc: ['', Validators.required],
    });
    const savedData = this.userService.getFormData('kyc');
    if (savedData) {
      this.kycForm.patchValue(savedData);
    }
    this.userService.setFormGroup('kyc', this.kycForm);
  }

  onPanInput(event: any) {
    this.kycForm.get('pan')?.setValue(event.target.value.toUpperCase());
  }

  back(): void {
    this.router.navigate(['/mainlayout/personal']);
  }

  submitForm(): void {
    if (this.kycForm.valid) {
      this.userService.setFormData('kyc', this.kycForm.value);
      this.router.navigate(['/mainlayout/passport']);
      console.log(this.kycForm.value);
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.kycForm.markAllAsTouched();
    }
  }
}
