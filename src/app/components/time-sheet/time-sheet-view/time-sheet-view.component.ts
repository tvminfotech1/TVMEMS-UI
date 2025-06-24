import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-time-sheet-view',
  templateUrl: './time-sheet-view.component.html',
  styleUrls: ['./time-sheet-view.component.css']
})
export class TimeSheetViewComponent implements OnInit {
  id: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    // Now use this.id to load data, call API, etc.
  }
  timesheet = {
    name: 'R, BHARATH',
    status: 'Pending Approval',
    id: 'VISATS00854457',
    period: '05/05/2025 to 11/05/2025',
    buyer: 'Visa Technology & Operations LLC',
    supplier: 'Infosys(I37Z)',
    workerId: 'VISAWK00070218',
    costCenter: '80024',
    description: 'GL - Prof Consulting-Contractors (821200) - 80024|837477|821200|810',
    dates: ['5/5', '6/5', '7/5', '8/5', '9/5', '10/5', '11/5'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    hours: [8.8, 8.8, 8.8, 8.8, 8.8, 0.0, 0.0],
    submitDate: '09/05/2025 09:48 AM',
    sowOwner: 'Vihol, Jayminshih',
    site: 'India Office (Bangalore) (4AP06)',
    businessUnit: 'Visa Technology & Operations LLC (810)'
  };

  get totalHours(): number {
    return this.timesheet.hours.reduce((a, b) => a + b, 0);
  }
}
