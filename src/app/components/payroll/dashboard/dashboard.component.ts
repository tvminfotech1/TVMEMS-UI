import { Component, OnInit } from '@angular/core';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Employee } from 'src/app/models/employee';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  employees: Employee[] = [];
  totalEmployees = 0;
  activeEmployees = 0;
  inactiveEmployees = 0;
  departmentCount = 0;
  recentEmployees: Employee[] = [];

  constructor(
    private employeeService: PayrollEmployeeService,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.employeeService.getEmployees().subscribe((data: Employee[]) => {
    console.log('All Employees:', data);

    this.employees = data;
    this.totalEmployees = data.length;
    this.activeEmployees = data.filter(emp => emp.status === 'Active').length;
    this.inactiveEmployees = data.filter(emp => emp.status === 'Inactive' || emp.status === 'Deactivated').length;
    this.departmentCount = new Set(data.map(emp => emp.department)).size;

    this.recentEmployees = [...data.slice(-2).reverse()];
    console.log('Recent Employees:', this.recentEmployees);
  });
}

  goToAddEmployee() {
    this.router.navigate(['/mainlayout/add-employee']);
  }

  goToAllEmployees() {
    this.router.navigate(['/mainlayout/payroll-employee']);
  }

  goToReports() {
    this.router.navigate(['/mainlayout/reports']);
  }
}
