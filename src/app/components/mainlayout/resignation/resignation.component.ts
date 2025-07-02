import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResingService } from './service/resing.service';

@Component({
  selector: 'app-resignation',
  templateUrl: './resignation.component.html',
  styleUrls: ['./resignation.component.css']
})
export class ResignationComponent implements OnInit {
  showForm = false;
  resignationForm: FormGroup;
  submittedData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private resingService: ResingService
  ) {
    this.resignationForm = this.fb.group({
      name: ['', Validators.required],
      employeeId: ['', Validators.required],
      reason: ['', Validators.required],
      explanation: ['', Validators.required],
      acknowledge: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.fetchResignations();
  }

  fetchResignations() {
    this.resingService.getResignations().subscribe({
      next: (data) => {
        this.submittedData = data.reverse(); // Newest first
      },
      error: (err) => {
        console.error('Error fetching resignations:', err);
      }
    });
  }

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  clearForm() {
    this.resignationForm.reset();
  }

  saveForm() {
    if (this.resignationForm.valid) {
      const formData = {
        ...this.resignationForm.value,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        status: 'Submitted'
      };

      this.resingService.submitResignation(formData).subscribe({
        next: (res) => {
          this.submittedData.unshift(res); // Add to top of list
          this.resignationForm.reset();
          this.showForm = false;
        },
        error: (err) => {
          console.error('Error saving resignation:', err);
        }
      });
    } else {
      this.resignationForm.markAllAsTouched();
    }
  }
}
