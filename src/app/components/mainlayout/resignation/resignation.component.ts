import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resignation',
  templateUrl: './resignation.component.html',
  styleUrls: ['./resignation.component.css']
})
export class ResignationComponent {
   showForm = false;
  resignationForm: FormGroup;
  submittedData: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.resignationForm = this.fb.group({
      name: ['', Validators.required],
      employeeId: ['', Validators.required],
      reason: ['', Validators.required],
      explanation: ['', Validators.required],
      acknowledge: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.http.get<any[]>('assets/resignations.json').subscribe(data => {
      this.submittedData = data;
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
        name: this.resignationForm.value.name,
        employeeId: this.resignationForm.value.employeeId,
        reason: this.resignationForm.value.reason,
        explanation: this.resignationForm.value.explanation,
        date: new Date().toLocaleDateString(),
        status: 'Submitted'
      };

      console.log('Form submitted:', formData);

      this.submittedData.push(formData);
      this.resignationForm.reset();
      this.showForm = false;
    } else {
      console.warn('Form is invalid');
      this.resignationForm.markAllAsTouched();
    }
  }
}