import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-previous-employment',
  templateUrl: './previous-employment.component.html',
  styleUrls: ['./previous-employment.component.css']
})
export class PreviousEmploymentComponent implements OnInit {
  showPopup = false;
  employmentForm!: FormGroup;
  employmentList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.employmentForm = this.fb.group({
      companyName: ['', Validators.required],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    // this.http.get<any[]>('assets/previous-employment.json').subscribe(data => {
    //   this.employmentList = data;
    // });

  }

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.employmentForm.reset();
  }

  saveEmployment(): void {
    if (this.employmentForm.valid) {
      this.employmentList.push(this.employmentForm.value);
      this.userService.setFormData('previousEmployment', this.employmentList);
      this.closePopup();
    } else {
      this.employmentForm.markAllAsTouched();
    }
  }

  deleteEmployment(index: number): void {
    this.employmentList.splice(index, 1);
  }

  finalSave(): void {
    if (this.employmentList.length > 0) {
      this.userService.setFormData('previousEmployment', this.employmentForm.value);
      this.router.navigate(['/mainlayout/education']);
    } else {
      alert('Please add at least one employment record.');
    }
  }
}
