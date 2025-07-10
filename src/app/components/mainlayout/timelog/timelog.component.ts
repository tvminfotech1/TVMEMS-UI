import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TimelogService, TimelogEntry } from './timelog.service';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';

type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.css']
})
export class TimelogComponent implements OnInit {
  years: number[] = [];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekendDates: string[] = [];
  weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  timelog = {
    year: new Date().getFullYear(),
    month: '',
    weekendDate: '',
    employeeName: '',
    employeeId: ''
  };

  timelogEntry: TimelogEntry = this.getEmptyEntry();
  timelogSummary: TimelogEntry[] = [];
  latestEntry: TimelogEntry | null = null;
  accordionState = [false, false, false];
  isFutureOrPastDateSelected = false;
  currentMondayISO = '';

  constructor(
    private timelogService: TimelogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setEmployeeDetailsFromToken();
    this.initializeYears();
    this.setCurrentWeek();
    this.loadTimelogs();
  }

  private setEmployeeDetailsFromToken(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.timelog.employeeName = decoded.sub || '';
      this.timelog.employeeId = decoded.empId || '';
      this.timelogEntry.employeeName = decoded.sub || '';
      this.timelogEntry.employeeId = decoded.empId || '';
    }
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  }

  setCurrentWeek(): void {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    this.currentMondayISO = monday.toISOString().split('T')[0];
    this.timelog.weekendDate = this.currentMondayISO;
  }

  onMonthOrYearChange(): void {
    if (this.timelog.month && this.timelog.year) {
      this.updateMondays(this.timelog.year, this.timelog.month);
    }
  }

  updateMondays(year: number, month: string): void {
    const monthIndex = this.months.indexOf(month);
    if (monthIndex < 0) return;

    const date = new Date(year, monthIndex, 1);
    this.weekendDates = [];

    while (date.getMonth() === monthIndex) {
      if (date.getDay() === 1) {
        const mondayISO = date.toISOString().split('T')[0];
        this.weekendDates.push(mondayISO);
      }
      date.setDate(date.getDate() + 1);
    }
  }

  onWeekendDateSelect(): void {
    if (this.timelog.weekendDate) {
      this.timelogEntry.weekendDate = this.timelog.weekendDate;
      this.populateWeekDays(this.timelog.weekendDate);
      this.openFillYourTimelogAccordion();

      const selected = new Date(this.timelog.weekendDate);
      const current = new Date(this.currentMondayISO);
      this.isFutureOrPastDateSelected = selected.getTime() !== current.getTime();
    }
  }

  populateWeekDays(selectedMonday: string): void {
    const mondayDate = new Date(selectedMonday);
    this.weekDays = [];

    for (let i = 0; i < 5; i++) {
      const day = new Date(mondayDate);
      day.setDate(mondayDate.getDate() + i);
      const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'long' }) as WeekDay;
      this.weekDays.push(dayOfWeek);
    }
  }

  calculateTotalHours(): void {
  let total = 0;
  for (const day of this.weekDays) {
    const value = this.timelogEntry.hours[day];
    if (value === 'WFO' || value === 'WFH') {
      total += 8;
    } else {
      total += 0;
    }
  }
  this.timelogEntry.totalHours = total.toString();
}


  toggleAccordion(index: number): void {
    this.accordionState[index] = !this.accordionState[index];
  }

  openFillYourTimelogAccordion(): void {
    this.accordionState = [false, false, true];
  }

  isWeekendDateDisabled(date: string): boolean {
    const dateObj = new Date(date);
    const current = new Date(this.currentMondayISO);
    return dateObj.getTime() !== current.getTime();
  }

 loadTimelogs(): void {
  this.timelogService.getTimelogs().subscribe(res => {
    const rawData = res.body || [];  

    const transformed = rawData.map((entry: any) => ({
      ...entry,
      hours: {
        Monday: entry.hours?.monday || '',
        Tuesday: entry.hours?.tuesday || '',
        Wednesday: entry.hours?.wednesday || '',
        Thursday: entry.hours?.thursday || '',
        Friday: entry.hours?.friday || ''
      },
      totalHours: entry.totalhours?.toString() || '0'
    }));

    const sorted = [...transformed].sort((a, b) =>
      new Date(b.weekendDate).getTime() - new Date(a.weekendDate).getTime()
    );

    this.latestEntry = sorted.find(entry =>
      entry.employeeId === this.timelog.employeeId
    ) || null;

    this.timelogSummary = sorted.filter(entry =>
      !(entry.employeeId === this.latestEntry?.employeeId &&
        entry.project === this.latestEntry?.project &&
        entry.weekendDate === this.latestEntry?.weekendDate)
    );
  });
}


  onSubmit(form: NgForm): void {
  if (!form.valid || this.isFutureOrPastDateSelected) {
    alert('Cannot submit. Only current week submissions are allowed.');
    return;
  }

  this.calculateTotalHours();

  // ✅ Convert day keys to lowercase
  const originalHours = this.timelogEntry.hours as { [key: string]: string };
const transformedHours: { [key: string]: string } = {};
for (const key in originalHours) {
  transformedHours[key.toLowerCase()] = originalHours[key];
}

 const fullEntry = {
  project: this.timelogEntry.project,
  hours: transformedHours,
  totalhours: parseFloat(this.timelogEntry.totalHours),
  description: this.timelogEntry.description,
  weekendDate: this.timelog.weekendDate
};

  const alreadySubmitted = this.timelogSummary.some(entry =>
    entry.employeeId === this.timelog.employeeId &&
    entry.weekendDate === this.timelog.weekendDate &&
    entry.project === this.timelogEntry.project
  );

  if (alreadySubmitted) {
    alert('Timesheet already submitted for this week and project.');
    return;
  }

  console.log('Sending to backend:', fullEntry);

  this.timelogService.addTimelog(fullEntry).subscribe({
    next: () => {
      alert('Timesheet submitted successfully.');
      this.loadTimelogs();

      form.resetForm({
        project: '',
        hours: {
          Monday: '',
          Tuesday: '',
          Wednesday: '',
          Thursday: '',
          Friday: ''
        },
        totalHours: '',
        description: ''
      });

      this.timelogEntry = this.getEmptyEntry();
    },
    error: err => {
      console.error('Error:', err);
      alert('Failed to submit timesheet.');
    }
  });
}


  private getEmptyEntry(): TimelogEntry {
    return {
      employeeName: '',
      employeeId: '',
      project: '',
      hours: {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: ''
      },
      totalHours: '',
      description: '',
      weekendDate: ''
    };
  }
}
