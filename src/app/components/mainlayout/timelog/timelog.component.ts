import { Component, OnInit } from '@angular/core';
import { TimelogService, TimelogEntry } from './timelog.service';
import { AuthService } from './auth.service';
import { NgForm } from '@angular/forms';

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
    employeeName: ''
  };

  timelogEntry: TimelogEntry = this.getEmptyEntry();

  timelogSummary: TimelogEntry[] = [];
  latestEntry: TimelogEntry | null = null;

  accordionState = [false, false, false];

  constructor(
    private timelogService: TimelogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const employee = this.authService.getAuthenticatedEmployee();
    this.timelog.employeeName = employee.employeeName;
    this.timelogEntry.employeeName = employee.employeeName;

    this.initializeYears();
    this.loadTimelogs();
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  }

  loadTimelogs(): void {
    this.timelogService.getTimelogs().subscribe(data => {
      this.timelogSummary = data;
      if (data.length > 0) {
        this.latestEntry = data[0];
      }
    });
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
        this.weekendDates.push(date.toISOString().split('T')[0]);
      }
      date.setDate(date.getDate() + 1);
    }
  }

  onWeekendDateSelect(): void {
    if (this.timelog.weekendDate) {
      this.timelogEntry.weekendDate = this.timelog.weekendDate;
      this.populateWeekDays(this.timelog.weekendDate);
      this.openFillYourTimelogAccordion();
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
      const val = parseFloat(this.timelogEntry.hours[day]) || 0;
      total += val;
    }
    this.timelogEntry.totalHours = total.toString();
  }

  toggleAccordion(index: number): void {
    this.accordionState[index] = !this.accordionState[index];
  }

  openFillYourTimelogAccordion(): void {
    this.accordionState = [false, false, true];
  }

  onSubmit(form: NgForm): void {
  if (!form.valid) {
    alert('Please fill all required fields correctly before submitting.');
    return;
  }

  this.calculateTotalHours();

  const fullEntry: TimelogEntry = {
    ...this.timelogEntry,
    employeeName: this.timelog.employeeName,
    weekendDate: this.timelog.weekendDate
  };

  // Ensure unique entry exists
  const alreadySubmitted = this.timelogSummary.some(entry =>
    entry.employeeName === fullEntry.employeeName &&
    entry.weekendDate === fullEntry.weekendDate &&
    entry.project === fullEntry.project
  );

  if (alreadySubmitted) {
    alert('Timesheet for this week and project has already been submitted.');
    return;
  }

  this.timelogService.addTimelog(fullEntry).subscribe({
    next: () => {
      alert('Timesheet submitted successfully.');

      // Optional: Instead of pushing manually, reload from backend
      this.loadTimelogs();

      // Set the latest entry for summary display
      this.latestEntry = fullEntry;

      // Reset form fields
      form.resetForm({
        employeeName: this.timelog.employeeName,
        weekendDate: this.timelog.weekendDate,
        project: '',
        wfol: false,
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
      this.timelogEntry.employeeName = this.timelog.employeeName;
      this.timelogEntry.weekendDate = this.timelog.weekendDate;
    },
    error: (err) => {
      console.error('Error adding entry:', err);
      alert('Failed to submit timesheet.');
    }
  });
}


  private getEmptyEntry(): TimelogEntry {
    return {
      employeeName: '',
      project: '',
      wfol: false,
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