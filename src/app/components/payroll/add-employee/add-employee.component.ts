import { Component } from '@angular/core';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Router } from '@angular/router';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent {
  employee: Employee = {
    id: 0,
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
      name: '',       
     photo: '' ,
    bankDetails: {
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branch: ''
}
 
  };

  constructor(private empService: PayrollEmployeeService, private router: Router) {}

  onSubmit() {
    this.empService.addEmployee(this.employee).subscribe(() => {
      alert('Employee Added Successfully!');
      this.router.navigate(['/employees']);
    });
  }
}
