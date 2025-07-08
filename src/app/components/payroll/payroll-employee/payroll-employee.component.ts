import { Component, OnInit } from '@angular/core';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Employee } from 'src/app/models/employee';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-payroll-employee',
  templateUrl: './payroll-employee.component.html',
  styleUrls: ['./payroll-employee.component.css']
})
export class PayrollEmployeeComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  // Filters
  selectedLocation: string = '';
  selectedStatus: string = '';
  selectedDesignation: string = '';

  uniqueLocations: string[] = [];
  uniqueStatuses: string[] = [];
  uniqueDesignations: string[] = [];

  excelEmployees: Employee[] = [];

  constructor(private employeeService: PayrollEmployeeService, private router: Router) {}

  ngOnInit(): void {
    this.selectedLocation = '';
    this.selectedStatus = '';
    this.selectedDesignation = '';
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data;
      this.filteredEmployees = [...data];
      this.extractUniqueFilters(data);
      console.log('Employees Loaded:', this.employees);
    });
  }

  extractUniqueFilters(data: Employee[]): void {
    this.uniqueLocations = [...new Set(data.map(emp => emp.location).filter(Boolean))];
    this.uniqueStatuses = [...new Set(data.map(emp => emp.status).filter(Boolean))];
    this.uniqueDesignations = [...new Set(data.map(emp => emp.designation).filter(Boolean))];
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      this.excelEmployees = (data as any[]).map((row: any): Employee => ({
        id: row['ID'] || '',
        firstName: row['First Name'] || '',
        lastName: row['Last Name'] || '',
        email: row['Email'] || '',
        phone: row['Phone'] || '',
        gender: row['Gender'] || '',
        dob: row['DOB'] || '',
        designation: row['Designation'] || '',
        department: row['Department'] || '',
        joiningDate: row['Joining Date'] || '',
        employeeType: row['Employee Type'] || '',
        reportingManager: row['Reporting Manager'] || '',
        location: row['Location'] || '',
        status: row['Status'] || '',
        ctc: +row['CTC'] || 0,
        basicSalary: +row['Basic Salary'] || 0,
        inHandSalary: +row['In-Hand Salary'] || 0,
        address: row['Address'] || '',
        aadhaarNumber: row['Aadhaar Number'] || '',
        panNumber: row['PAN Number'] || '',
        bloodGroup: row['Blood Group'] || '',
        emergencyContact: row['Emergency Contact'] || '',
        profileImageUrl: row['Profile Image URL'] || 'https://static.vecteezy.com/system/resources/previews/032/176/191/non_2x/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg',
        bankDetails: {
          bankName: row['Bank Name'] || '',
          accountNumber: row['Account Number'] || '',
          ifscCode: row['IFSC Code'] || '',
          branch: row['Branch'] || ''
        }
      }));
    };

    reader.readAsBinaryString(file);
  }

  uploadData(): void {
    if (!this.excelEmployees.length) return;

    const total = this.excelEmployees.length;
    let uploaded = 0;

    for (let emp of this.excelEmployees) {
      this.employeeService.addEmployee(emp).subscribe({
        next: () => {
          uploaded++;
          if (uploaded === total) {
            alert(`All ${total} employees imported successfully!`);
            this.loadEmployees();
          }
        },
        error: (err) => {
          console.error('Failed to upload employee:', err);
        }
      });
    }
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp =>
      (this.selectedLocation === '' || emp.location === this.selectedLocation) &&
      (this.selectedStatus === '' || emp.status === this.selectedStatus) &&
      (this.selectedDesignation === '' || emp.designation === this.selectedDesignation)
    );
    console.log('Filtered:', this.filteredEmployees);
  }

  resetFilters(): void {
    this.selectedLocation = '';
    this.selectedStatus = '';
    this.selectedDesignation = '';
    this.filteredEmployees = [...this.employees];
  }

  viewPayRun(emp: Employee): void {
    if (emp.status === 'Active') {
      this.router.navigate(['/mainlayout/payruns', emp.id]);
    } else {
      alert(`Deactivated employee can't get salary.`);
    }
  }

  navigateToAddEmployee(): void {
    this.router.navigate(['/mainlayout/add-employee']);
  }
}