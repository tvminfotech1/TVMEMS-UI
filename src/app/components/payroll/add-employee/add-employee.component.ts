import { Component, OnInit } from '@angular/core';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Router } from '@angular/router';
import { Employee } from 'src/app/models/employee';
// Use the shared UserService located at src/app/components
import { UserService } from './user.service';

export interface EmployeePayload  {
  id?: number;  
  fullName: string;
  email: string;
  phone: string;
  department: string;
  joiningDate: string;
  employeeType: string;
  location: string;
  status: string;
  ctc: number;
  basicSalary: number;
  inHandSalary: number;
  aadhaarNumber: string;
  panNumber: string;
 

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
export class AddEmployeeComponent implements OnInit {
  // searchId: number | null = null; 
  searchId: number = 0; 
  employee: Employee ={
    fullName: '',
    email: '',
    phone: '',
    department: '',
    joiningDate: '',
    employeeType: '',
    location: '',
    status: 'Active',
    ctc: 0,
    basicSalary: 0,
    inHandSalary: 0,
    aadhaarNumber: '',
    panNumber: '',

    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branch: ''
    },
    id: 0
  };

  constructor(
    private empService: PayrollEmployeeService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employee.status = 'Active';
  }

searchEmployee() {
  if (!this.searchId) {
    alert('Please enter an Employee ID');
    return;
  }

  // Fetch user details
    this.userService.getUserById(this.searchId).subscribe(
    (userData: any) => {
      this.employee.fullName = userData.fullName;
      this.employee.email = userData.email;
      this.employee.phone = userData.mobile;
      this.employee.aadhaarNumber = userData.aadhar;
      this.employee.joiningDate = userData.dob; // adjust if needed

      // Then fetch PAN number
      this.userService.getKycByEmployeeId(this.searchId).subscribe(
        (kycData: any) => {
          this.employee.panNumber = kycData.body?.pan || '';
        },
        (error: any) => {
          console.warn('KYC not found for employee:', this.searchId);
          this.employee.panNumber = '';
        }
      );
    },
    (error: any) => {
      alert('Employee not found!');
      console.error(error);
    }
  );
}


  onSubmit(): void {
    console.log('Payroll employee data:', this.employee);
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
