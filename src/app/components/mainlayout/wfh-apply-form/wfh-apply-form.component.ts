import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { WorkFromHomeService } from 'src/app/services/work-from-home.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Custom validator function for date logic
export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const fromDateValue = control.get('fromDate')?.value;
  const toDateValue = control.get('toDate')?.value;

  if (!fromDateValue || !toDateValue) return null;

  const fromDate = new Date(fromDateValue);
  const toDate = new Date(toDateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);


  if (fromDate < today) {
    return { fromDatePast: true };
  }

  if (toDate < today) {
    return { toDatePast: true };
  }

  return null;
};

@Component({
  selector: 'app-wfh-apply-form',
  templateUrl: './wfh-apply-form.component.html',
  styleUrls: ['./wfh-apply-form.component.css']
})

export class WfhApplyFormComponent implements OnInit {

  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  wfhForm: FormGroup;
  employeeEmail: string = 'Unknown Employee';
  employeeName: string = 'Unknown Employee';
  employeeId: string = 'Unknown Employee';
  submissionError: string | null = null;

  today: String = ' ';  //

  constructor(
    private fb: FormBuilder,
    private wfhService: WorkFromHomeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.wfhForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10),Validators.maxLength(30)]],
      approver: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]]
    },
      { validators: dateRangeValidator } //
    );
  }

  ngOnInit(): void {
    this.employeeEmail = this.authService.getEmailFromToken() || 'Employee email';
    this.employeeId = this.authService.getEmployeeId() || 'Employee Id';
    this.employeeName = this.authService.getfullName() || 'Employee Name';
    const now = new Date();              //
    this.today = now.toISOString().split('T')[0];   //
  }

  onSubmit(): void {
    console.log('Submit clicked, form valid:', this.wfhForm.valid);
    // debugger
    this.submissionError = null;
    if (this.wfhForm.valid) {
      const formValue = this.wfhForm.value;
      console.log(formValue);


      const newWfhRequest = {
        // id: 0,
        employeeEmail: this.employeeEmail,
        employeeId: this.employeeId,
        employeeName: this.employeeName,
        fromDate: formValue.fromDate,
        toDate: formValue.toDate,
        reason: formValue.reason,
        approver: formValue.approver,
        status: 'pending',
        action: 'N/A'
      };

      this.wfhService.createWfhRequest(newWfhRequest).subscribe({

        next: (response) => {
          this.wfhForm.reset();

          this.formSubmitted.emit(response);
          this.showSnackBar('WFH request submitted successfully!', 'success-snackbar');
        },
      
        error: (error) => {
          console.error('Error submitting WFH Request:', error);

          if (error.status === 400) {
            this.showSnackBar('Invalid data provided. Please check your inputs.', 'error-snackbar');
          } else if (error.status === 500) {
            this.showSnackBar('Server error. Please try again later.', 'error-snackbar');
          } else {
            this.showSnackBar('Failed to submit request. Please try again.', 'error-snackbar');
          }
        }
      });
    } else {
      this.wfhForm.markAllAsTouched();
      this.showSnackBar('Please fill all required fields correctly.', 'error-snackbar');
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
    this.showSnackBar('WFH request cancelled.', 'error-snackbar');
  }

  blockApproverInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'delete', ' '];
    const pattern = /[A-Za-z]/;

    if (!pattern.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    const input = event.target as HTMLInputElement;
    if (input.value.length >= 20) {
      event.preventDefault();
    }
  }

  onOverlayClick(event: MouseEvent) {
    this.onCancel();
  }

   private showSnackBar(message: string, panelClass: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}