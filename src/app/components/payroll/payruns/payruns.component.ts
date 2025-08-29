import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { SalaryHistoryService } from 'src/app/services/salary-history.service';
import { Employee } from 'src/app/models/employee';
import { SalaryHistory } from 'src/app/models/salaryHistory';

@Component({
  selector: 'app-payruns',
  templateUrl: './payruns.component.html',
  styleUrls: ['./payruns.component.css']
})
export class PayrunsComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  salaryHistory: SalaryHistory[] = [];

  searchText: string = '';
  selectedMonth: string = new Date().toISOString().slice(0, 7); // e.g. "2025-08"

  constructor(
    private employeeService: PayrollEmployeeService,
    private salaryService: SalaryHistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      emps: this.employeeService.getEmployees(),
      salaries: this.salaryService.getAllSalaryHistory()
    }).subscribe(({ emps, salaries }) => {
      console.log('Employees:', emps);
      console.log('Salary History:', salaries);

      // Keep only Active employees
      this.employees = emps.filter(emp => emp.status === 'Active');
      this.filteredEmployees = [...this.employees];

      this.salaryHistory = salaries;
    });
  }

  /** Check if salary is paid for employee in selected month */
  isPaid(empId: number): boolean {
    return this.salaryHistory.some(
      (sal) => sal.id === empId && sal.month === this.selectedMonth
    );
  }

  /** Search employees by ID or Name */
  onSearch(): void {
    const text = this.searchText.toLowerCase().trim();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.id.toString().toLowerCase().includes(text) ||
      (`${emp.firstName} ${emp.lastName}`).toLowerCase().includes(text)
    );
  }

  /** View or Generate salary slip */
  viewOrGenerateSalary(emp: Employee): void {
    const salaryRecord = this.salaryHistory.find(
      (s) => s.id === emp.id && s.month === this.selectedMonth
    );

    if (salaryRecord) {
      // Navigate to View salary slip details
      this.router.navigate(['/mainlayout/payruns', emp.id, salaryRecord.salaryId]);
    } else {
      if (emp.status === 'Active') {
        this.router.navigate(['/mainlayout/payruns', emp.id], {
          queryParams: { month: this.selectedMonth }
        });
      } else {
        alert("Deactivated employee can't get salary.");
      }
    }
  }

  /** Check if salary slip is already generated */
  isSalaryGenerated(emp: Employee): boolean {
    return this.salaryHistory.some(
      (s) => s.id === emp.id && s.month === this.selectedMonth
    );
  }
}
