import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { SalaryHistoryService } from 'src/app/services/salary-history.service';
import { Employee, Payruns } from 'src/app/models/employee';
import { SalaryHistory } from 'src/app/models/salaryHistory';

@Component({
  selector: 'app-payruns',
  templateUrl: './payruns.component.html',
  styleUrls: ['./payruns.component.css'],
})
export class PayrunsComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  salaryHistory: SalaryHistory[] = [];
  payruns: Payruns[] = [];
  filteredData: Payruns[] = [];

  searchText: string = '';
  selectedMonth: string = new Date().toISOString().slice(0, 7);

  constructor(
    private employeeService: PayrollEmployeeService,
    private salaryService: SalaryHistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    this.selectedMonth = currentMonth;
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      emps: this.employeeService.getPayRunData(this.selectedMonth),
      salaries: this.salaryService.getAllSalaryHistory(),
    }).subscribe(({ emps, salaries }) => {
      const activeEmployees = (emps || []).filter(
        (emp) => emp.status === 'Active'
      );
      this.payruns = [...activeEmployees];
      this.filteredData = [...this.payruns];
      this.salaryHistory = salaries.body;
    });
  }

  getMonthName(): string {
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  onMonthChange() {
    this.loadData();
  }

  isPaid(empId: number): boolean {
    return this.salaryHistory.some(
      (sal) => sal.id === empId && sal.month === this.selectedMonth
    );
  }

  onSearch(): void {
    const text = this.searchText.toLowerCase().trim();
    this.filteredEmployees = this.employees.filter(
      (emp) =>
        emp.id.toString().toLowerCase().includes(text) ||
        `${emp.fullName}`.toLowerCase().includes(text)
    );
  }

  GenerateSalary(emp: Payruns): void {
    const salaryRecord = this.isSalaryGenerated(emp);
    const month = this.selectedMonth;
    if (salaryRecord) {
      this.downloadSalarySlip(emp.employeeId, month);
    } else {
      if (emp.status === 'Active') {
        this.router.navigate(['/mainlayout/payruns', emp.employeeId], {
          queryParams: { month: this.selectedMonth },
        });
      } else {
        alert("Deactivated employee can't get salary.");
      }
    }
  }

  isSalaryGenerated(emp: Payruns): boolean {
    if (!this.salaryHistory || !this.salaryHistory.length) return false;

    return this.salaryHistory.some(
      (s) =>
        s.payRoleEmployee.id === emp.employeeId &&
        s.month === this.selectedMonth
    );
  }

  downloadSalarySlip(employeeId: number, month: string): void {
    this.salaryService.downloadSalarySlip(employeeId, month).subscribe(
      (data: Blob) => {
        if (!data || data.size === 0) {
          alert('Payslip file is empty or not generated.');
          return;
        }
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${employeeId}_${month}.pdf`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (err) => {
        console.error('Error downloading salary slip:', err);
        alert('Failed to download salary slip. Please try again later.');
      }
    );
  }
}
