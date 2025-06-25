import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalaryHistoryService } from 'src/app/services/salary-history.service';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Employee } from 'src/app/models/employee';
import { SalaryHistory } from 'src/app/models/salaryHistory';
declare var require: any;
const html2pdf = require('html2pdf.js');
@Component({
  selector: 'app-yearly-salary-slip',
  templateUrl: './yearly-salary-slip.component.html',
  styleUrls: ['./yearly-salary-slip.component.css']
})
export class YearlySalarySlipComponent implements OnInit {
  employee!: Employee;
  salaryHistory: SalaryHistory[] = [];

  constructor(
    private route: ActivatedRoute,
    private salaryService: SalaryHistoryService,
    private employeeService: PayrollEmployeeService
  ) {}

 ngOnInit(): void {
  const empId = this.route.snapshot.paramMap.get('empId');
  const selectedYear = this.route.snapshot.queryParamMap.get('year');

  if (empId) {
    this.employeeService.getEmployeeById(empId).subscribe(emp => {
      this.employee = emp;
    });

    this.salaryService.getAllSalaryHistory().subscribe(salaries => {
      this.salaryHistory = salaries.filter(s =>
        s.id === empId &&
        (!selectedYear || s.year.toString() === selectedYear)
      );
    });
  }
}


  calculateTotalEarnings(salary: SalaryHistory): number {
    return salary.basicSalary + salary.hra + salary.medicalAllowance +
           salary.conveyanceAllowance + salary.flexiBenefit +
           salary.leaveTravel + salary.specialAllowance;
  }

  calculateTotalDeductions(salary: SalaryHistory): number {
    return salary.professionalTax + salary.incomeTax + salary.leaveDeduction +
           salary.otherDeduction + salary.esi + salary.pf;
  }

  downloadAllSlips(): void {
    this.salaryHistory.forEach(salary => {
      const element = document.getElementById('slip-' + salary.salaryId);
      const options = {
        margin: 0.2,
        filename: `${salary.salaryId}-PaySlip.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 4 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().from(element).set(options).save();
    });
  }
}
