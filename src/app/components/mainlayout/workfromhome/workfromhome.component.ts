import { Component } from '@angular/core';

@Component({
  selector: 'app-workfromhome',
  templateUrl: './workfromhome.component.html',
  styleUrls: ['./workfromhome.component.css']
})
export class WorkfromhomeComponent {
currentMonthIndex = 5; // June (0-based)
  year = 2025;

  requests = [
    { status: 'approved', count: 1 },
    { status: 'pending', count: 0 },
    { status: 'rejected', count: 0 },
  ];

  get totalRequests(): number {
    return 6; // you can update this dynamically
  }

  getMonthName(): string {
    return new Date(this.year, this.currentMonthIndex).toLocaleString('default', { month: 'long' });
  }

  nextMonth() {
    if (this.currentMonthIndex < 11) this.currentMonthIndex++;
  }

  prevMonth() {
    if (this.currentMonthIndex > 0) this.currentMonthIndex--;
  }

  getProgress(status: string): number {
    const found = this.requests.find(r => r.status === status);
    return found ? Math.round((found.count / this.totalRequests) * 100) : 0;
  }

  getCount(status: string): number {
    const found = this.requests.find(r => r.status === status);
    return found ? found.count : 0;
  }
  details = [{
    fromDate: '02 Jun 25',
    toDate: '02 Jun 25',
    days: '1 Day',
    reason: 'Transport Disruptions',
    created: '22 May 25',
    approver: 'Praveenkumar Subramanian',
    status: 'Approved'
  }];
}
