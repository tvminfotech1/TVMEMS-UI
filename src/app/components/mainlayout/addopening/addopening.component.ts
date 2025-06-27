import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MainLayoutService } from '../Service/MainLayoutService';
import { JobPosting } from '../goal/interface/job-openingDto';
import { MainLayoutService } from '../resignation/service/MainLayoutSevice';

@Component({
  selector: 'app-addopening',
  templateUrl: './addopening.component.html',
  styleUrls: ['./addopening.component.css']
})
export class AddOpeningComponent implements OnInit {
  jobForm: FormGroup;
  submittedJobs: JobPosting[] = [];

  @Output() jobPosted = new EventEmitter<JobPosting>();
  
  constructor(
    private fb: FormBuilder,
    private mainLayoutService: MainLayoutService
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      qualifications: ['', Validators.required],
      yearOfPassout: ['', [Validators.required, Validators.min(1900)]],
      location: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]],
      skills: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Initialization logic (no POST request here)
  }

  onSubmit(): void {
    if (this.jobForm.valid) {
      const formData: JobPosting = {
        ...this.jobForm.value,
        qualifications: this.jobForm.value.qualifications
          .split(',')
          .map((q: string) => q.trim()),
        skills: this.jobForm.value.skills
          .split(',')
          .map((s: string) => s.trim()),
        yearOfPassout: String(this.jobForm.value.yearOfPassout),
        experience: String(this.jobForm.value.experience),
        status: 'OPEN'
      };

      this.mainLayoutService.postJobPostings(formData).subscribe({
        next: (data: JobPosting) => {
          console.log('Job Posted Successfully:', data);
          // this.submittedJobs.push(data);
           this.jobPosted.emit(data);
          this.jobForm.reset();
        },
        error: (err: any) => {
          console.error('Error posting job:', err);
        }
      });
    } else {
      this.jobForm.markAllAsTouched();
    }
  }
}
