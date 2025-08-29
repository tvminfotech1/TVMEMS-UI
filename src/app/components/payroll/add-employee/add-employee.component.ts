import { Component } from '@angular/core';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Router } from '@angular/router';
import { Employee } from 'src/app/models/employee';

export interface EmployeePayload  {
  id?: number;  
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  designation: string;
  department: string;
  joiningDate: string;
  employeeType: string;
  reportingManager: string;
  location: string;
  status: string;
  ctc: number;
  basicSalary: number;
  inHandSalary: number;
  address: string;
  aadhaarNumber: string;
  panNumber: string;
  bloodGroup: string;
  emergencyContact: string;
  profileImageUrl: string;

  bankDetails: {
    id?: number;  
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
}


@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent {
  employee: Employee ={
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    designation: '',
    department: '',
    joiningDate: '',
    employeeType: '',
    reportingManager: '',
    location: '',
    status: '',
    ctc: 0,
    basicSalary: 0,
    inHandSalary: 0,
    address: '',
    aadhaarNumber: '',
    panNumber: '',
    bloodGroup: '',
    emergencyContact: '',
    profileImageUrl: '',

    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branch: ''
    },
    id: 0
  };

  constructor(private empService: PayrollEmployeeService, private router: Router) {}

  onSubmit() {
    console.log('payroll employee:', this.employee); 

    this.empService.addEmployee(this.employee).subscribe(() => {
      alert('Employee Added Successfully!');
      this.router.navigate(['/mainlayout/payroll-employee']);
    });
  }

  onCancel() {
  if (confirm('Are you sure you want to exit? Any unsaved data will be lost.')) {
    this.router.navigate(['/mainlayout/payroll-employee']);
  }
}

}
