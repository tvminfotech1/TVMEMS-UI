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
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  allSalaries: SalaryHistory[] = [];
  selectedYear: string = new Date().getFullYear().toString();
  availableYears: string[] = [];
  reportData: {
    employee: Employee,
    salaries: SalaryHistory[],
    totalPaid: number,
    remainingCTC: number
  }[] = [];

  constructor(
    private salaryService: SalaryHistoryService,
    private employeeService: PayrollEmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.salaryService.getAllSalaryHistory().subscribe(salaries => {
      this.allSalaries = salaries;
      this.availableYears = [...new Set(salaries.map(s => s.year.toString()))];

      this.updateReport();
    });
  }

  updateReport(): void {
    this.reportData = [];
const filteredSalaries = this.allSalaries.filter(s => s.year.toString() === this.selectedYear);
    const employeeIds = [...new Set(filteredSalaries.map(s => s.id))];

    employeeIds.forEach(empId => {
      this.employeeService.getEmployeeById(empId).subscribe(emp => {
        const empSalaries = filteredSalaries.filter(s => s.id === empId);
        const totalPaid = empSalaries.reduce((acc, s) => acc + s.netPay, 0);
        const remainingCTC = emp.ctc - totalPaid;

        this.reportData.push({
          employee: emp,
          salaries: empSalaries,
          totalPaid,
          remainingCTC
        });
      });
    });
  }

  onYearChange(): void {
    this.updateReport();
  }

viewSlip(empId: string) {
  this.router.navigate(['/mainlayout/reports', empId], {
    queryParams: { year: this.selectedYear }
  });
}




  downloadReport(): void {
    const element = document.getElementById('overview-report');
    const options = {
      margin: 0.5,
      filename: `Salary-Report-${this.selectedYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().from(element).set(options).save();
  }
}