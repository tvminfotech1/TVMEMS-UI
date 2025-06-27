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
  isFutureOrPastDateSelected = false;
  currentMondayISO = '';

  constructor(
    private timelogService : TimelogService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    const employee = this.authService.getAuthenticatedEmployee();
    this.timelog.employeeName = employee.employeeName;
    this.timelogEntry.employeeName = employee.employeeName;

    this.initializeYears();
    this.loadTimelogs();
    this.setCurrentWeek();
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

  loadTimelogs(): void {
  this.timelogService.getTimelogs().subscribe(data => {
    // Sort by date descending to find the most recent
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.weekendDate).getTime();
      const dateB = new Date(b.weekendDate).getTime();
      return dateB - dateA;
    });

    // Get latest for this user
    const employeeName = this.timelog.employeeName;
    this.latestEntry = sorted.find(entry => entry.employeeName === employeeName) || null;

    // Exclude latest from the summary
    this.timelogSummary = sorted.filter(entry =>
      !(entry.employeeName === this.latestEntry?.employeeName &&
        entry.project === this.latestEntry?.project &&
        entry.weekendDate === this.latestEntry?.weekendDate)
      );
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
        const mondayISO = date.toISOString().split('T')[0];
        this.weekendDates.push(mondayISO);
      }
      date.setDate(date.getDate() + 1);
    }
  }

  isWeekendDateDisabled(date: string): boolean {
    const dateObj = new Date(date);
    const current = new Date(this.currentMondayISO);
    return dateObj.getTime() !== current.getTime();
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
    if (!form.valid || this.isFutureOrPastDateSelected) {
      alert('Cannot submit. Only current week submissions are allowed.');
      return;
    }

    this.calculateTotalHours();

    const fullEntry: TimelogEntry = {
      ...this.timelogEntry,
      employeeName: this.timelog.employeeName,
      weekendDate: this.timelog.weekendDate
    };

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
        this.loadTimelogs();
        this.latestEntry = fullEntry;

        form.resetForm({
          employeeName: this.timelog.employeeName,
          weekendDate: this.timelog.weekendDate,
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