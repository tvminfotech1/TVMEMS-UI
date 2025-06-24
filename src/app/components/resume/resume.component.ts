import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user-service.service';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css']
})
export class ResumeComponent implements OnInit {

  resumeForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.resumeForm = this.formBuilder.group({
      achievements: ['', Validators.required],
      resumeCate: ['', Validators.required],
    });

    // this.http.get<any>('assets/resume-data.json').subscribe(data => {
    //   this.resumeForm.patchValue({
    //     achievements: data.achievements,
    //     resumeCate: data.resumeCate
    //   });
    // });

    this.userService.setFormData('education', this.resumeForm);
  }

  submitForm() {
    if (this.resumeForm.valid) {
      this.userService.setFormData('resume', this.resumeForm.value);
      this.router.navigate(['/mainlayout/final']);
    } else {
      alert('All fields are mandatory');
      this.resumeForm.markAllAsTouched();
    }
  }
}
