import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobPosting } from '../goal/interface/job-openingDto';
import { MainLayoutService } from '../resignation/service/MainLayoutSevice';

@Component({
  selector: 'app-addopening',
  templateUrl: './addopening.component.html',
  styleUrls: ['./addopening.component.css'],
})
export class AddOpeningComponent implements OnInit {
  jobForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  @Output() jobPosted = new EventEmitter<JobPosting>();

  constructor(
    private fb: FormBuilder,
    private mainLayoutService: MainLayoutService
  ) {
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      qualifications: ['', Validators.required],
      yearOfPassout: [
        '',
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(new Date().getFullYear()),
        ],
      ],
      location: ['', Validators.required],
      experience: [
        '',
        [Validators.required, Validators.min(0), Validators.max(50)],
      ],
      skills: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
  if (this.jobForm.invalid) {
    this.jobForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;

  const formData: JobPosting = {
    ...this.jobForm.value,
    qualifications: this.jobForm.value.qualifications
      .split(',')
      .map((q: string) => q.trim())
      .filter((q: string) => q.length > 0),
    skills: this.jobForm.value.skills
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0),
    yearOfPassout: Number(this.jobForm.value.yearOfPassout),
    experience: Number(this.jobForm.value.experience),
    status: 'OPEN',
  };

  this.mainLayoutService.postJobPostings(formData).subscribe({
    next: (data: JobPosting) => {

      alert('Job posted successfully');

      this.jobForm.reset();

      Object.values(this.jobForm.controls).forEach(control => {
        control.setErrors(null);
        control.markAsPristine();
        control.markAsUntouched();
      });

      this.jobForm.updateValueAndValidity();
    },
    error: (err) => {
      alert('Failed to post job');
      console.error(err);
    },
    complete: () => {
      this.isSubmitting = false;
    }
  });
}

  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;
    if (!/^[a-zA-Z. ]$/.test(char)) {
      event.preventDefault();
    }
  }

  preventInvalidInput(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }
  allowSixDigitPincode(event: KeyboardEvent): void {
  const char = event.key;
  const input = (event.target as HTMLInputElement).value;

  if (!/^[0-9]$/.test(char)) {
    event.preventDefault();
    return;
  }

  
  if (input.length === 0 && char === '0') {
    event.preventDefault();
    return;
  }
  
  if (input.length >= 4) {
    event.preventDefault();
  }
}
}
