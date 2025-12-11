import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user-service.service';
import { MainlayoutService } from 'src/app/services/main-layout.service';
import { FormProgressService } from 'src/app/services/form-progress.service';
import { AlertService } from 'src/app/alert-service.service';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css'],
})
export class ResumeComponent implements OnInit {
  resumeForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private alertservice: AlertService,
    private mainlayoutService: MainlayoutService,
     private progressService :FormProgressService,
  ) {}

  ngOnInit(): void {
    this.resumeForm = this.formBuilder.group({
      achievements: ['', Validators.required],
      resumeCate: ['', Validators.required],
    });

    const savedData = this.userService.getFormData('resume');
    if (savedData) {
      this.resumeForm.patchValue(savedData);
    }
  }

  back() {
    this.router.navigate(['/mainlayout/document']);
  }

  submitForm() {
    if (this.resumeForm.valid) {
      this.userService.setFormData('resume', this.resumeForm.value);
           this.progressService.markStepComplete(10);
      this.mainlayoutService.markTabCompleted('resume', true);
            this.router.navigate(['/mainlayout/final']);
    } else {
      this.alertservice.showError('Please fill all required fields');
      this.resumeForm.markAllAsTouched();
    }
  }
}
