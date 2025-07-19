import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TimelogService, TimelogEntry, Hours } from './timelog.service';
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

  isAdmin: boolean = false;
  isUser: boolean = false;

  constructor(
    private timelogService: TimelogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.setEmployeeDetailsFromToken();
    this.initializeYears();
    this.setCurrentWeek();
    this.loadTimelogs();
  }

  private setEmployeeDetailsFromToken(): void {
    const token = this.authService.getToken();
    if (token) {
      this.timelog.employeeName = this.authService.getfullName() || '';
      this.timelog.employeeId = this.authService.getEmployeeId() || '';
      this.timelogEntry.employeeName = this.timelog.employeeName;
      this.timelogEntry.employeeId = this.timelog.employeeId;
    }
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
  }

  setCurrentWeek(): void {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    this.currentMondayISO = monday.toISOString().split('T')[0];
    this.timelog.weekendDate = this.currentMondayISO;
    this.timelog.month = this.months[monday.getMonth()];
    this.timelog.year = monday.getFullYear();
    this.onMonthOrYearChange();
  }

  onMonthOrYearChange(): void {
    if (!this.timelog.month) {
      this.timelog.month = this.months[new Date().getMonth()];
    }

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
    this.weekendDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (!this.weekendDates.includes(this.timelog.weekendDate)) {
        this.timelog.weekendDate = this.currentMondayISO;
        if (!this.weekendDates.includes(this.timelog.weekendDate) && this.weekendDates.length > 0) {
            this.timelog.weekendDate = this.weekendDates[0];
        } else if (this.weekendDates.length === 0) {
            this.timelog.weekendDate = '';
        }
    }
    this.onWeekendDateSelect();
  }

  onWeekendDateSelect(): void {
    if (this.timelog.weekendDate) {
      this.timelogEntry.weekendDate = this.timelog.weekendDate;
      this.populateWeekDays(this.timelog.weekendDate);
      this.openFillYourTimelogAccordion();

      const selected = new Date(this.timelog.weekendDate);
      const current = new Date(this.currentMondayISO);
      this.isFutureOrPastDateSelected = selected.getTime() !== current.getTime();

      if (this.isFutureOrPastDateSelected) {
          this.timelogEntry = this.getEmptyEntry();
          this.timelogEntry.employeeName = this.timelog.employeeName;
          this.timelogEntry.employeeId = this.timelog.employeeId;
      }
      this.loadTimesheetForSelectedWeek();
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
    this.timelogEntry.hours = {
      Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: ''
    };
  }

  calculateTotalHours(): void {
    let total = 0;
    (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as WeekDay[]).forEach(day => {
        const value = this.timelogEntry.hours[day];
        if (value === 'WFO' || value === 'WFH') {
            total += 8;
        }
    });
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

      const transformed: TimelogEntry[] = rawData.map((entry: any) => ({
        id: entry.id,
        employeeName: entry.employeeName || this.authService.getfullName() || '',
        employeeId: entry.employeeId || this.authService.getEmployeeId() || '',
        project: entry.project,
        hours: {
          Monday: entry.hours?.monday || '',
          Tuesday: entry.hours?.tuesday || '',
          Wednesday: entry.hours?.wednesday || '',
          Thursday: entry.hours?.thursday || '',
          Friday: entry.hours?.friday || ''
        } as Hours,
        totalHours: entry.totalhours?.toString() || '0',
        description: entry.description,
        weekendDate: entry.weekendDate,
        status: entry.status || 'Pending'
      }));

      const sorted = [...transformed].sort((a: TimelogEntry, b: TimelogEntry) =>
        new Date(b.weekendDate).getTime() - new Date(a.weekendDate).getTime()
      );

      const currentUserTimelogs = sorted.filter((entry: TimelogEntry) => entry.employeeId === this.timelog.employeeId);

      this.latestEntry = currentUserTimelogs.length > 0 ? currentUserTimelogs[0] : null;

      this.timelogSummary = sorted.filter((entry: TimelogEntry) =>
        !(entry.employeeId === this.timelog.employeeId &&
          entry.weekendDate === this.latestEntry?.weekendDate &&
          entry.project === this.latestEntry?.project)
      );

      if (this.isAdmin) {
          const currentMonthIndex = this.months.indexOf(this.timelog.month);
          this.timelogSummary = transformed.filter((entry: TimelogEntry) =>
              new Date(entry.weekendDate).getFullYear() === this.timelog.year &&
              new Date(entry.weekendDate).getMonth() === currentMonthIndex
          ).sort((a: TimelogEntry, b: TimelogEntry) => new Date(b.weekendDate).getTime() - new Date(a.weekendDate).getTime());
          this.latestEntry = null;
      }
      this.loadTimesheetForSelectedWeek();
    });
  }

  loadTimesheetForSelectedWeek(): void {
    if (this.timelog.employeeId && this.timelog.weekendDate) {
      const existingEntry = this.timelogSummary.find((entry: TimelogEntry) =>
        entry.employeeId === this.timelog.employeeId &&
        entry.weekendDate === this.timelog.weekendDate
      );

      if (existingEntry) {
        this.timelogEntry = { ...existingEntry };
        this.timelogEntry.totalHours = existingEntry.totalHours.toString();
        const mappedHours: Hours = {
            Monday: existingEntry.hours.Monday,
            Tuesday: existingEntry.hours.Tuesday,
            Wednesday: existingEntry.hours.Wednesday, // Fixed typo: changed 'existing' to 'existingEntry'
            Thursday: existingEntry.hours.Thursday,
            Friday: existingEntry.hours.Friday
        };
        this.timelogEntry.hours = mappedHours;
      } else {
        this.timelogEntry = this.getEmptyEntry();
        this.timelogEntry.employeeName = this.timelog.employeeName;
        this.timelogEntry.employeeId = this.timelog.employeeId;
        this.timelogEntry.weekendDate = this.timelog.weekendDate;
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      alert('Please fill all required fields in the timesheet.');
      return;
    }

    if (this.isFutureOrPastDateSelected) {
      alert('Cannot submit. Only current week submissions are allowed.');
      return;
    }

    this.calculateTotalHours();

    const transformedHours: { [key: string]: string } = {};
    for (const day in this.timelogEntry.hours) {
      if (Object.prototype.hasOwnProperty.call(this.timelogEntry.hours, day)) {
        transformedHours[day.toLowerCase()] = this.timelogEntry.hours[day as WeekDay];
      }
    }

    const fullEntry: TimelogEntry = {
      id: this.timelogEntry.id || 0,
      employeeName: this.timelogEntry.employeeName,
      employeeId: this.timelogEntry.employeeId,
      project: this.timelogEntry.project,
      hours: transformedHours as any as Hours, // Fixed: Assert to 'any' first, then to 'Hours'
      totalHours: parseFloat(this.timelogEntry.totalHours).toString(),
      description: this.timelogEntry.description,
      weekendDate: this.timelog.weekendDate,
      status: this.timelogEntry.status || 'Pending'
    };

    const alreadySubmitted = this.timelogSummary.some((entry: TimelogEntry) =>
      entry.employeeId === this.timelog.employeeId &&
      entry.weekendDate === this.timelog.weekendDate &&
      entry.project === this.timelogEntry.project &&
      (!this.timelogEntry.id || entry.id !== this.timelogEntry.id)
    );

    if (alreadySubmitted && !this.timelogEntry.id) {
      alert('Timesheet already submitted for this week and project. You can edit the existing one.');
      return;
    }

    console.log('Sending to backend:', fullEntry);

    this.timelogService.addTimelog(fullEntry).subscribe({
      next: () => {
        alert('Timesheet submitted successfully.');
        form.resetForm();
        this.timelogEntry = this.getEmptyEntry();
        this.setEmployeeDetailsFromToken();
        this.loadTimelogs();
      },
      error: err => {
        console.error('Error submitting timesheet:', err);
        alert('Failed to submit timesheet.');
      }
    });
  }

  updateTimesheetStatus(entry: TimelogEntry, newStatus: 'Approved' | 'Rejected'): void {
      if (!entry.id) {
          alert('Cannot update status for an entry without an ID.');
          return;
      }
      this.timelogService.updateTimesheetStatus(entry.id, newStatus).subscribe({
          next: () => {
              alert(`Timesheet for ${entry.employeeName} (${entry.weekendDate}) ${newStatus}.`);
              this.loadTimelogs();
          },
          error: err => {
              console.error('Error updating timesheet status:', err);
              alert('Failed to update timesheet status.');
          }
      });
  }

  private getEmptyEntry(): TimelogEntry {
    return {
      project: '',
      hours: {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: ''
      } as Hours,
      totalHours: '0',
      description: '',
      weekendDate: '',
      employeeName: this.timelog.employeeName,
      employeeId: this.timelog.employeeId,
      status: 'Pending'
    };
  }
}