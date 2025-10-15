import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResingService } from './service/resing.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-resignation',
  templateUrl: './resignation.component.html',
  styleUrls: ['./resignation.component.css'],
})
export class ResignationComponent implements OnInit {
  showForm = false;
  resignationForm: FormGroup;
  submittedData: any[] = [];
  isAdmin = false;
  isUser = false;
  employeeId: string | null = null;
  fullName: string | null = null;
  hasSubmittedResignation = false;

  constructor(
    private fb: FormBuilder,
    private resingService: ResingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.resignationForm = this.fb.group({
      name: ['', Validators.required],
      employeeId: ['', Validators.required],
      reason: ['', Validators.required],
      explanation: ['', Validators.required],
      acknowledge: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.fullName = this.authService.getfullName();

    if (this.isAdmin) {
      this.fetchAllResignations();
    } else if (this.isUser) {
      const email = this.authService.getEmailFromToken();
      if (email) {
        this.authService.getUserId(email).subscribe({
          next: (id) => {
            this.employeeId = id.toString();
            this.resignationForm.patchValue({
              name: this.fullName,
              employeeId: this.employeeId,
            });
            this.fetchResignationByEmployeeId(this.employeeId);
          },
          error: (err) =>
            console.error('Error fetching employeeId by email:', err),
        });
      }
    }
  }

  fetchAllResignations() {
    this.resingService.getResignations().subscribe({
      next: (data) => {
        this.submittedData = data
          .filter((d) => d.status === 'Submitted' || d.status === 'Pending')
          .reverse();
      },
      error: (err) => console.error('Error fetching resignations:', err),
    });
  }

  fetchResignationByEmployeeId(empId: string) {
    this.resingService.getResignationsByEmployeeId(empId).subscribe({
      next: (res) => {
        console.log('response', res);

        if (res.status === 'Approved') {
          this.submittedData = [res];
          this.hasSubmittedResignation = true;
        } else if (res.status === 'Rejected') {
          this.submittedData = [res];
          this.hasSubmittedResignation = false;
        } else {
          this.submittedData = [];
          this.hasSubmittedResignation = false;
        }
      },
      error: (err) => {
        console.error('Error fetching resignation by employee ID:', err);
        this.hasSubmittedResignation = false;
      },
    });
  }

  updateStatus(data: any, newStatus: 'Approved' | 'Rejected') {
    data.status = newStatus;

    this.resingService.updateResignationStatus(data).subscribe({
      next: (res) => {
        console.log(`Resignation ${newStatus.toLowerCase()}:`, res);

        if (this.isAdmin) {
          this.submittedData = this.submittedData.filter(
            (item) => item.id !== data.id
          );

          if (newStatus === 'Rejected') {
            if (data.employeeId === this.employeeId) {
              this.hasSubmittedResignation = false;
              this.submittedData = [res];
              this.snackBar.open(
                'Your resignation was rejected. You can submit a new request.',
                'Close',
                {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                  panelClass: ['info-snackbar'],
                }
              );
            }
          }
        }
      },
      error: (err) =>
        console.error(`Error updating resignation to ${newStatus}:`, err),
    });
  }

  openForm() {
    if (this.hasSubmittedResignation) {
      this.snackBar.open(
        'You have already submitted your resignation. You cannot apply again.',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        }
      );
      return;
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  clearForm() {
    this.resignationForm.reset({
      name: this.fullName,
      employeeId: this.employeeId,
    });
  }

  saveForm() {
    if (this.resignationForm.valid) {
      const formData = {
        ...this.resignationForm.value,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
      };

      this.resingService.submitResignation(formData).subscribe({
        next: (res) => {
          this.submittedData.unshift(res);
          this.resignationForm.reset({
            name: this.fullName,
            employeeId: this.employeeId,
          });
          this.showForm = false;
          this.hasSubmittedResignation = true;
        },
        error: (err) => {
          console.error('Error saving resignation:', err);
        },
      });
    } else {
      this.resignationForm.markAllAsTouched();
    }
  }
}
