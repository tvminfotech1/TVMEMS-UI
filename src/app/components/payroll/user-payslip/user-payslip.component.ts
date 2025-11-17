import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SalaryHistoryService } from 'src/app/services/salary-history.service';

export interface PayslipData {
  month: string;
  monthNumber: number;
  action: string;
}

@Component({
  selector: 'app-user-payslip',
  templateUrl: './user-payslip.component.html',
  styleUrls: ['./user-payslip.component.css'],
})
export class UserPayslipComponent {
  displayedColumns: string[] = ['month', 'action'];

  generatedPayslipMonths: Set<string> = new Set();

  payslipData: PayslipData[] = [
    { month: 'January', monthNumber: 1, action: 'download' },
    { month: 'February', monthNumber: 2, action: 'download' },
    { month: 'March', monthNumber: 3, action: 'download' },
    { month: 'April', monthNumber: 4, action: 'download' },
    { month: 'May', monthNumber: 5, action: 'download' },
    { month: 'June', monthNumber: 6, action: 'download' },
    { month: 'July', monthNumber: 7, action: 'download' },
    { month: 'August', monthNumber: 8, action: 'download' },
    { month: 'September', monthNumber: 9, action: 'download' },
    { month: 'October', monthNumber: 10, action: 'download' },
    { month: 'November', monthNumber: 11, action: 'download' },
    { month: 'December', monthNumber: 12, action: 'download' },
  ];
  employeeId: number | null = null;
  joiningYear: number | null = null;
  joiningMonth: number | null = null;
  minYear: number | null = null;
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;

  selectedYear: number = this.currentYear;

  constructor(
    private salaryService: SalaryHistoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const empId = this.authService.getEmployeeId();
    if (empId) {
      this.employeeId = Number(empId);
      this.salaryService.getJoiningDate(this.employeeId).subscribe({
        next: (res) => {
          if (res) {
            const date = new Date(res.body.joiningDate);
            this.joiningYear = date.getFullYear();
            this.joiningMonth = date.getMonth() + 1;
            this.minYear = this.joiningYear;
          }
        },
        error: (err) => console.error('Failed to get joining date', err),
      });
      this.salaryService.getSalaryByEmployeeId(this.employeeId).subscribe({
  next: (res: any[]) => {
    res.forEach((item: any) => {
      const formatted = `${item.year}-${item.month.split('-')[1].padStart(2, '0')}`;
      this.generatedPayslipMonths.add(formatted);
    });
  },
  error: (err) => console.error('Failed to fetch salary history', err),
});
    }
  }

  isPreviousYearDisabled(): boolean {
    return this.minYear !== null && this.selectedYear <= this.minYear;
  }

  isNextYearDisabled(): boolean {
    return this.selectedYear >= this.currentYear;
  }

  previousYear(): void {
    if (!this.isPreviousYearDisabled()) {
      this.selectedYear--;
    }
  }

  nextYear(): void {
    if (!this.isNextYearDisabled()) {
      this.selectedYear++;
    }
  }

  isMonthDisabled(index: number): boolean {
    const monthNumber = index + 1;

    const formattedMonth = `${this.selectedYear}-${String(monthNumber).padStart(2, '0')}`;

  
    if (!this.generatedPayslipMonths.has(formattedMonth)) {
      return true;
    }

    if (
      this.selectedYear === this.joiningYear &&
      monthNumber < this.joiningMonth!
    ) {
      return true;
    }

    if (
      this.selectedYear === this.currentYear &&
      monthNumber > this.currentMonth
    ) {
      return true;
    }

    return false;
  }

  downloadPayslip(monthName: string): void {
  if (!this.employeeId) return alert('Employee ID not found.');

  const monthObj = this.payslipData.find(m => m.month === monthName);
  if (!monthObj) return alert('Invalid month.');

  const formattedMonth = `${this.selectedYear}-${String(monthObj.monthNumber).padStart(2, '0')}`;

  if (!this.generatedPayslipMonths.has(formattedMonth)) {
    return alert('Payslip not generated for this month.');
  }

  this.salaryService.downloadSalarySlip(this.employeeId, formattedMonth).subscribe({
    next: (response: Blob) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${monthName}_${this.selectedYear}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
      link.remove();
    },
    error: (err) => {
      console.error('Error generating payslip', err);
      alert('Failed to generate payslip.');
    }
  });
}

}
