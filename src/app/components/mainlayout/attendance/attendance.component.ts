import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent {
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  currentMonthIndex = new Date().getMonth(); // 0 = January
  currentYear = new Date().getFullYear();

  // Compute current month's display string like "01 June 2025 - 30 June 2025"
  get selectedMonthYear(): string {
    const start = this.getMonthStart(this.currentYear, this.currentMonthIndex);
    const end = this.getMonthEnd(this.currentYear, this.currentMonthIndex);
    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  }

  getMonthStart(year: number, monthIndex: number): Date {
    return new Date(year, monthIndex, 1);
  }

  getMonthEnd(year: number, monthIndex: number): Date {
    return new Date(year, monthIndex + 1, 0);
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = this.months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  goToPreviousMonth() {
    if (this.currentMonthIndex === 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    } else {
      this.currentMonthIndex--;
    }
  }

  goToNextMonth() {
    if (this.currentMonthIndex === 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    } else {
      this.currentMonthIndex++;
    }
  }

  attendance = [
    {
      date: 'Tue 03 Jun 25',
      working: '00h, 00m',
      break: '00h, 40m',
      total: '01h, 00m',
      status: '',
      highlight: false
    },
    {
      date: 'Mon 02 Jun 25',
      working: '05h, 54m',
      break: '01h, 01m',
      total: '06h, 55m',
      status: 'Present WFH (Full Day)',
      highlight: true
    },
    {
      date: 'Sun 01 Jun 25',
      working: '',
      break: '',
      total: '',
      status: 'Weekoff',
      highlight: false
    }
  ];
}
