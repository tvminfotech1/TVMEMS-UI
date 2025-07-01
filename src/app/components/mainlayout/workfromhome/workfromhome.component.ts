import { Component } from '@angular/core';

@Component({
  selector: 'app-workfromhome',
  templateUrl: './workfromhome.component.html',
  styleUrls: ['./workfromhome.component.css']
})
export class WorkfromhomeComponent {
  currentMonthIndex = 5;
  year = 2025;

  getMonthName(): string {
    return new Date(this.year, this.currentMonthIndex).toLocaleString('default', { month: 'long' });
  }

  nextMonth() {
    if (this.currentMonthIndex < 11) this.currentMonthIndex++;
  }

  prevMonth() {
    if (this.currentMonthIndex > 0) this.currentMonthIndex--;
  }

  details = [
    {
      fromDate: '01 Jun 25',
      toDate: '01 Jun 25',
      days: '1 Day',
      reason: 'Internet connectivity issue',
      created: '28 May 25',
      approver: 'Praveenkumar Subramanian',
      employee: 'Kavin Kishore',
      status: 'approved'
    },
    {
      fromDate: '02 Jun 25',
      toDate: '02 Jun 25',
      days: '1 Day',
      reason: 'Doctor appointment',
      created: '29 May 25',
      approver: 'Meena Lakshmi',
      employee: 'Divya R',
      status: 'pending'
    },
    {
      fromDate: '03 Jun 25',
      toDate: '03 Jun 25',
      days: '1 Day',
      reason: 'Attending workshop',
      created: '30 May 25',
      approver: 'Sundar Raman',
      employee: 'Vignesh S',
      status: 'rejected'
    },
    {
      fromDate: '04 Jun 25',
      toDate: '04 Jun 25',
      days: '1 Day',
      reason: 'Home renovation work',
      created: '31 May 25',
      approver: 'Karthik Raj',
      employee: 'Harini T',
      status: 'pending'
    },
    {
      fromDate: '05 Jun 25',
      toDate: '06 Jun 25',
      days: '2 Days',
      reason: 'Family function',
      created: '01 Jun 25',
      approver: 'Meena Lakshmi',
      employee: 'Rajesh Kumar',
      status: 'approved'
    },
    {
      fromDate: '07 Jun 25',
      toDate: '07 Jun 25',
      days: '1 Day',
      reason: 'Vehicle breakdown',
      created: '02 Jun 25',
      approver: 'Sundar Raman',
      employee: 'Anjali Menon',
      status: 'pending'
    },
    {
      fromDate: '08 Jun 25',
      toDate: '08 Jun 25',
      days: '1 Day',
      reason: 'Bank work',
      created: '03 Jun 25',
      approver: 'Karthik Raj',
      employee: 'Naveen R',
      status: 'rejected'
    },
    {
      fromDate: '09 Jun 25',
      toDate: '10 Jun 25',
      days: '2 Days',
      reason: 'Child care',
      created: '04 Jun 25',
      approver: 'Meena Lakshmi',
      employee: 'Sathya Priya',
      status: 'approved'
    },
    {
      fromDate: '11 Jun 25',
      toDate: '11 Jun 25',
      days: '1 Day',
      reason: 'Guest at home',
      created: '05 Jun 25',
      approver: 'Sundar Raman',
      employee: 'Mohammed Arif',
      status: 'pending'
    },
    {
      fromDate: '12 Jun 25',
      toDate: '12 Jun 25',
      days: '1 Day',
      reason: 'Personal reasons',
      created: '06 Jun 25',
      approver: 'Praveenkumar Subramanian',
      employee: 'Jennifer L',
      status: 'pending'
    }
  ];

  get totalRequests(): number {
    return this.details.length;
  }

  getCount(status: string): number {
    return this.details.filter(d => d.status === status).length;
  }

  getProgress(status: string): number {
    const count = this.getCount(status);
    return this.totalRequests > 0 ? Math.round((count / this.totalRequests) * 100) : 0;
  }

  updateStatus(request: any, newStatus: 'approved' | 'rejected' | 'pending') {
    request.status = newStatus;
  }
}
