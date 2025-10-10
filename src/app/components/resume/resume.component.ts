import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainlayoutService } from 'src/app/services/main-layout.service';

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
    private http: HttpClient,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private mainlayoutService: MainlayoutService
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
      this.router.navigate(['/mainlayout/final']);
      this.mainlayoutService.markTabCompleted('resume', true);
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.resumeForm.markAllAsTouched();
    }
  }
}
