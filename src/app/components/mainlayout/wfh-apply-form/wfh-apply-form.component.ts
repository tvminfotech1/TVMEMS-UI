import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkFromHomeService } from 'src/app/services/work-from-home.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-wfh-apply-form',
  templateUrl: './wfh-apply-form.component.html',
  styleUrls: ['./wfh-apply-form.component.css']
})
export class WfhApplyFormComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  wfhForm: FormGroup;
  employeeName: string = 'Unknown Employee';
  submissionError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private wfhService: WorkFromHomeService,
    private authService: AuthService
  ) {
    this.wfhForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      approver: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.employeeName = this.authService.getfullName() || 'Employee Name';
  }

  onSubmit(): void {
  console.log('Submit clicked, form valid:', this.wfhForm.valid);
    // debugger
    this.submissionError = null;
    if (this.wfhForm.valid) {
      const formValue = this.wfhForm.value;
      console.log(formValue);
      

      const newWfhRequest = {
        id: 0,
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
          console.log('WFH Request submitted successfully:', response);
          this.wfhForm.reset();
          this.formSubmitted.emit();
        },
        error: (error) => {
          console.error('Error submitting WFH Request:', error);
          this.submissionError = 'Failed to submit request. Please try again.';
          if (error.status === 400) {
             this.submissionError = 'Invalid data provided. Please check your inputs.';
          } else if (error.status === 500) {
             this.submissionError = 'Server error. Please try again later.';
          }
        }
      });
    } else {
      this.submissionError = 'Please fill all required fields correctly.';
      this.wfhForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }
}