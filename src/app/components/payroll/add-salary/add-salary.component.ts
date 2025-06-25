import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { SalaryHistoryService } from 'src/app/services/salary-history.service';
import { Employee } from 'src/app/models/employee';
import { SalaryHistory } from 'src/app/models/salaryHistory';
@Component({
  selector: 'app-add-salary',
  templateUrl: './add-salary.component.html',
  styleUrls: ['./add-salary.component.css']
})
export class AddSalaryComponent implements OnInit {
  @ViewChild('paySlip', { static: false }) paySlipElement!: ElementRef;

  employee!: Employee;
  
  payMonth: string = (new Date().getMonth() + 1).toString().padStart(2, '0'); // YYYY-MM
  payYear: number = new Date().getFullYear();

  // Earnings
  basicSalary = 0;
  hra = 0;
  medicalAllowance = 0;
  conveyanceAllowance = 0;
  flexiBenefit = 0;
  leaveTravel = 0;
  specialAllowance = 0;

  // Deductions
  pf = 0;
  esi = 0;
  professionalTax = 208;
  incomeTax = 0;
  leaveDeduction = 0;
  otherDeduction = 0;

  // Totals
  totalEarnings = 0;
  totalDeductions = 0;
  netPay = 0;
  ctc = 0;
  remainingCtc = 0;

  nwd: number = 31; // No. of Working Days
nol: number = 0;  // No. of Leaves


  constructor(
    private route: ActivatedRoute,
    private employeeService: PayrollEmployeeService,
    private salaryService: SalaryHistoryService
  ) {}

  ngOnInit(): void {
  const empId = this.route.snapshot.paramMap.get('id');
  const selectedMonth = this.route.snapshot.queryParamMap.get('month');

  setTimeout(() => {
    this.updateNWDFromMonth();
  });
  if (selectedMonth) {
    this.payMonth = selectedMonth; // set payMonth (bound to <input type="month">)
    this.payYear = parseInt(selectedMonth.split('-')[0]); // extract year
  } else {
    this.payMonth = new Date().toISOString().substring(0, 7);
    this.payYear = new Date().getFullYear();
  }

  if (empId) {
    this.employeeService.getEmployeeById(empId).subscribe(emp => {
      this.employee = emp;
      this.basicSalary = emp.basicSalary;
      this.ctc = emp.ctc;
      this.calculateSalary();
    });
  }
}

updateNWDFromMonth(): void {
  const [year, month] = this.payMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based in input but 0-based in Date
  this.nwd = daysInMonth;
  this.calculateSalary();
}



  calculateSalary(): void {
    this.totalEarnings =
      this.basicSalary +
      this.hra +
      this.medicalAllowance +
      this.conveyanceAllowance +
      this.flexiBenefit +
      this.leaveTravel +
      this.specialAllowance;

    this.totalDeductions =
      this.pf +
      this.esi +
      this.professionalTax +
      this.incomeTax +
      this.leaveDeduction +
      this.otherDeduction;

    this.netPay = this.totalEarnings - this.totalDeductions;
    this.remainingCtc = this.ctc - (this.totalEarnings + this.totalDeductions);
  }

  addSalary(): void {
  const month = this.payMonth;
  const empId = this.employee.id;

  this.salaryService.getSalaryByEmployeeAndMonth(empId, month).subscribe(existing => {
    if (existing && existing.length > 0) {
      alert(`Salary already generated for ${month}.`);
      return;
    }

    const salary: SalaryHistory = {
      salaryId: `${empId}-${month.replace('-', '')}`,
      id: empId,
      month: month,
      year: parseInt(month.split('-')[0]),

      basicSalary: this.basicSalary,
      hra: this.hra,
      medicalAllowance: this.medicalAllowance,
      conveyanceAllowance: this.conveyanceAllowance,
      flexiBenefit: this.flexiBenefit,
      leaveTravel: this.leaveTravel,
      specialAllowance: this.specialAllowance,

      pf: this.pf,
      esi: this.esi,
      professionalTax: this.professionalTax,
      incomeTax: this.incomeTax,
      leaveDeduction: this.leaveDeduction,
      otherDeduction: this.otherDeduction,

      netPay: this.netPay,
      ctc: this.ctc,
      remainingCtc: this.remainingCtc,

      nwd: this.nwd,
      nol: this.nol
    };

    this.salaryService.addSalaryHistory(salary).subscribe({
      next: () => alert('Salary added successfully.'),
      error: () => alert('Failed to add salary.')
    });
  });
}

}
