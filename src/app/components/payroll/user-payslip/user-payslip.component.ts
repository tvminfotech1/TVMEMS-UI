import { Component } from '@angular/core';
import { SalaryHistory } from 'src/app/models/salaryHistory';
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
  styleUrls: ['./user-payslip.component.css']
})
export class UserPayslipComponent {
  displayedColumns: string[] = ['month', 'action'];

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

          // Set minYear and selectedYear
          this.minYear = this.joiningYear;  // <-- This is what controls year selector
          // this.selectedYear = this.joiningYear;

          console.log('Joining Year:', this.joiningYear, 'Month:', this.joiningMonth);
        }
      },
      error: (err) => console.error('Failed to get joining date', err)
    });
  }
}

isPreviousYearDisabled(): boolean {
  return this.selectedYear <= (this.minYear || this.currentYear);
}

isNextYearDisabled(): boolean {
  return this.selectedYear >= this.currentYear;
}

previousYear(): void {
  if (this.selectedYear > (this.minYear || this.currentYear)) {
    this.selectedYear--;
  }
}

nextYear(): void {
  if (this.selectedYear < this.currentYear) {
    this.selectedYear++;
  }
}

isMonthDisabled(monthIndex: number): boolean {
  if (!this.joiningYear || !this.joiningMonth) return true;

  const monthNumber = monthIndex + 1;

  // Disable months before joining month in joining year
  if (this.selectedYear === this.joiningYear && monthNumber < this.joiningMonth) return true;

  // Disable future months in current year
  if (this.selectedYear === this.currentYear && monthNumber > this.currentMonth) return true;

  return false;
}


downloadPayslip(monthName: string): void {
    if (!this.employeeId) {
      alert('Employee ID not found. Please log in again.');
      return;
    }

    const monthObj = this.payslipData.find(m => m.month === monthName);
    if (!monthObj) {
      alert('Invalid month.');
      return;
    }

    const formattedMonth = `${this.selectedYear}-${String(monthObj.monthNumber).padStart(2, '0')}`;
    console.log(`Download payslip for Employee: ${this.employeeId}, Month: ${formattedMonth}`);

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
        console.error('Error downloading payslip', err);
        alert('Failed to download payslip. Please try again later.');
      }
    });
  }
 

}
