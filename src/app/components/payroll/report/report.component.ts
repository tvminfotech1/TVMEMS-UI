import { Component, OnInit } from '@angular/core';
import { SalaryHistoryService } from 'src/app/services/salary-history.service';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Employee } from 'src/app/models/employee';
import { SalaryHistory } from 'src/app/models/salaryHistory';
import { Router } from '@angular/router';

declare var require: any;
const html2pdf = require('html2pdf.js');

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  allSalaries: SalaryHistory[] = [];
  selectedYear: string = new Date().getFullYear().toString();
  availableYears: string[] = [];
  reportData: {
    employee: Employee;
    salaries: SalaryHistory[];
    totalPaid: number;
    remainingCTC: number;
  }[] = [];

  summary = {
    totalEmployees: 0,
    totalCTC: 0,
    totalPaid: 0,
    remainingCTC: 0,
  };

  loading: boolean = false;

  constructor(
    private salaryService: SalaryHistoryService,
    private employeeService: PayrollEmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSalaryHistory();
  }

  loadSalaryHistory(): void {
    this.loading = true;
    this.salaryService.getAllSalaryHistory().subscribe({
      next: (response) => {
        this.allSalaries = response.body;
        const years = new Set(this.allSalaries.map((s) => s.year.toString()));
        this.availableYears = Array.from(years).sort((a, b) => +b - +a);
        this.updateReport();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading salary history:', err);
        this.loading = false;
      },
    });
  }

  updateReport(): void {
    this.reportData = [];
    this.summary = {
      totalEmployees: 0,
      totalCTC: 0,
      totalPaid: 0,
      remainingCTC: 0,
    };

    const filteredSalaries = this.allSalaries.filter(
      (s) => s.year.toString() === this.selectedYear
    );

    if (filteredSalaries.length === 0) {
      console.warn('⚠️ No salary data found for year', this.selectedYear);
      return;
    }

    this.employeeService.getEmployees().subscribe((allEmployees) => {
      const report = allEmployees.map((emp) => {
        const empSalaries = filteredSalaries.filter((s) =>
          s.salaryId.startsWith(emp.id.toString())
        );
        const totalPaid = empSalaries.reduce((acc, s) => acc + s.netPay, 0);
        const remainingCTC = emp.ctc - totalPaid;

        return {
          employee: emp,
          salaries: empSalaries,
          totalPaid,
          remainingCTC,
        };
      });

      this.reportData = report.filter((r) => r.salaries.length > 0);

      this.summary.totalEmployees = this.reportData.length;
      this.summary.totalCTC = this.reportData.reduce(
        (acc, r) => acc + r.employee.ctc,
        0
      );
      this.summary.totalPaid = this.reportData.reduce(
        (acc, r) => acc + r.totalPaid,
        0
      );
      this.summary.remainingCTC = this.reportData.reduce(
        (acc, r) => acc + r.remainingCTC,
        0
      );
    });
  }

  onYearChange(): void {
    this.updateReport();
  }

  viewSlip(empId: string): void {
    this.router.navigate(['/mainlayout/reports', empId], {
      queryParams: { year: this.selectedYear },
    });
  }

  downloadReport(): void {
    const element = document.getElementById('overview-report');
    if (!element) return;

    const options = {
      margin: 0.5,
      filename: `Salary-Report-${this.selectedYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
    };

    html2pdf().from(element).set(options).save();
  }
}
