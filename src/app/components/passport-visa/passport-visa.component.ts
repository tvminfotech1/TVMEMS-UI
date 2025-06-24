import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-passport-visa',
  templateUrl: './passport-visa.component.html',
  styleUrls: ['./passport-visa.component.css']
})
export class PassportVisaComponent implements OnInit {
  passportValue: string = '';
  userForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      nationality: ['', Validators.required],
      ifPassport: ['', Validators.required],
      passportNumber: ['']
    });

    this.userService.setFormGroup('passport', this.userForm);

    // Conditional validator
    this.userForm.get('ifPassport')?.valueChanges.subscribe(value => {
      this.passportValue = value; 
      const passportCtrl = this.userForm.get('passportNumber');
      if (value === 'Yes') {
        passportCtrl?.setValidators(Validators.required);
      } else {
        passportCtrl?.clearValidators();
      }
      passportCtrl?.updateValueAndValidity();
    });

    // this.loadJsonData();
  }

  // loadJsonData(): void {
  //   this.http.get<any>('assets/passport.json').subscribe(data => {
  //     this.userForm.patchValue(data);
  //   });
  // }

  submitForm() {
    if (this.userForm.valid) {
      this.userService.setFormData('passport', this.userForm.value);
      this.router.navigate(['/mainlayout/family']);
    } else {
      alert("All fields are mandatory (if applicable)");
      this.userForm.markAllAsTouched();
    }
  }
}
