import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent {
  current_countryValue: string = '';
  userForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {
    this.userForm = this.formBuilder.group({
      fname: ['', Validators.required],
      mname: [''],
      lname: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      dob: ['', Validators.required],
      merital: ['', Validators.required],
      marriegedate: [''],
      current_address: ['', Validators.required],
      current_country: ['', Validators.required],
      other_country: [''],
      current_state: ['', Validators.required],
      current_city: ['', Validators.required],
      current_pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      current_contact: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      permanent_country: ['', Validators.required],
      permanent_address: ['', Validators.required],
      permanent_state: ['', Validators.required],
      permanent_city: ['', Validators.required],
      permanent_pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      permanent_contact: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      bcp_address: ['', Validators.required],
      bcp_country: ['', Validators.required],
      bcp_state: ['', Validators.required],
      bcp_city: ['', Validators.required],
      bcp_pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      emergency_contact_name: ['', Validators.required],
      emergency_contact_number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emergency_relationship: ['', Validators.required],
      exp_year: ['', Validators.required],
      exp_month: ['', Validators.required],
      relevantYear: ['', Validators.required]
    });

    // this.userService.setFormGroup('personal', this.userForm);
    // this.loadJsonData();  // Load data into form
  }

  // loadJsonData() {
  //   this.http.get<any>('assets/personal.json').subscribe(data => {
  //     this.userForm.patchValue(data);
  //   });
  // }
copyCurrentToPermanent(event: any): void {
  const checked = event.target.checked;

  if (checked) {
    this.userForm.patchValue({
      permanent_address: this.userForm.value.current_address,
      permanent_country: this.userForm.value.current_country,
      permanent_state: this.userForm.value.current_state,
      permanent_city: this.userForm.value.current_city,
      permanent_pincode: this.userForm.value.current_pincode,
      permanent_contact: this.userForm.value.current_contact
    });

    // Optional: Disable permanent fields to prevent editing
    this.userForm.get('permanent_address')?.disable();
    this.userForm.get('permanent_country')?.disable();
    this.userForm.get('permanent_state')?.disable();
    this.userForm.get('permanent_city')?.disable();
    this.userForm.get('permanent_pincode')?.disable();
    this.userForm.get('permanent_contact')?.disable();
  } else {
    this.userForm.patchValue({
      permanent_address: '',
      permanent_country: '',
      permanent_state: '',
      permanent_city: '',
      permanent_pincode: '',
      permanent_contact: ''
    });

    // Re-enable fields
    this.userForm.get('permanent_address')?.enable();
    this.userForm.get('permanent_country')?.enable();
    this.userForm.get('permanent_state')?.enable();
    this.userForm.get('permanent_city')?.enable();
    this.userForm.get('permanent_pincode')?.enable();
    this.userForm.get('permanent_contact')?.enable();
  }
}

  submitForm() {
  if (this.userForm.valid) {
    const formValue = {
      ...this.userForm.value,
      current_pincode: +this.userForm.value.current_pincode,
      permanent_pincode: +this.userForm.value.permanent_pincode,
      bcp_pincode: +this.userForm.value.bcp_pincode,
      current_contact: +this.userForm.value.current_contact,
      permanent_contact: +this.userForm.value.permanent_contact,
      emergency_contact_number: +this.userForm.value.emergency_contact_number
    };

    this.userService.setFormData('personal', formValue);
    this.router.navigate(['/mainlayout/kyc']);
  } else {
    alert("All fields are mandatory");
    this.userForm.markAllAsTouched();
  }
}

}
