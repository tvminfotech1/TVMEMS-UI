import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-addopening',
  templateUrl: './addopening.component.html',
  styleUrls: ['./addopening.component.css']
})
export class AddOpeningComponent implements OnInit {
  jobForm: FormGroup;
  submittedJobs: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
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
    this.http.get<any[]>('assets/job-openings.json').subscribe(data => {
      this.submittedJobs = data;
    });
  }

  onSubmit() {
    if (this.jobForm.valid) {
      const formData = {
        ...this.jobForm.value,
        qualifications: this.jobForm.value.qualifications
          .split(',')
          .map((q: string) => q.trim()),
        skills: this.jobForm.value.skills
          .split(',')
          .map((s: string) => s.trim())
      };
      this.submittedJobs.push(formData);
      console.log('Job Posted:', formData);
      this.jobForm.reset();
    } else {
      this.jobForm.markAllAsTouched();
    }
  }
}
