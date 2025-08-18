import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TimelogService, TimelogEntry, Hours } from './timelog.service';
import { AuthService } from 'src/app/services/auth.service';
import { DateUtilsService } from './date-utils.service';

type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.css']
})
export class TimelogComponent implements OnInit {
  years: number[] = [];
  months: string[] = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  weekendDates: string[] = [];
  weekDays: WeekDay[] = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

  timelog = { year: new Date().getFullYear(), month: '', weekendDate: '', employeeName: '', employeeId: '' };
  timelogEntry: TimelogEntry = this.getEmptyEntry();
  timelogSummary: TimelogEntry[] = [];
  latestEntry: TimelogEntry | null = null;
  accordionState = [false, false, true];
  isFutureOrPastDateSelected = false;
  currentMondayISO = '';

  isAdmin = false;
  isUser = false;

  constructor(
    private timelogService: TimelogService,
    private authService: AuthService,
    private dateUtils: DateUtilsService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.setEmployeeDetailsFromToken();
    this.initializeYears();
    this.setCurrentWeek();
    this.loadTimelogs();
  }

  setEmployeeDetailsFromToken(): void {
    this.timelog.employeeName = this.authService.getfullName() || '';
    this.timelog.employeeId = this.authService.getEmployeeId() || '';
    this.timelogEntry.employeeName = this.timelog.employeeName;
    this.timelogEntry.employeeId = this.timelog.employeeId;
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
  }

  setCurrentWeek(): void {
    this.currentMondayISO = this.dateUtils.getCurrentMondayISO();
    this.timelog.weekendDate = this.currentMondayISO;
    const mondayDate = new Date(this.currentMondayISO);
    this.timelog.month = this.months[mondayDate.getMonth()];
    this.timelog.year = mondayDate.getFullYear();
    this.onMonthOrYearChange();
  }

  onMonthOrYearChange(): void {
    if (!this.timelog.month) {
      this.timelog.month = this.months[new Date().getMonth()];
    }
    const monthIndex = this.months.indexOf(this.timelog.month);
    this.weekendDates = this.dateUtils.getAllMondaysOfMonth(this.timelog.year, monthIndex);
    if (!this.weekendDates.includes(this.timelog.weekendDate)) {
      this.timelog.weekendDate = this.weekendDates[0] || '';
    }
    this.onWeekendDateSelect();
  }

  onWeekendDateSelect(): void {
    if (!this.timelog.weekendDate) return;
    this.timelogEntry.weekendDate = this.timelog.weekendDate;
    const selected = new Date(this.timelog.weekendDate);
    const current = new Date(this.currentMondayISO);
    this.isFutureOrPastDateSelected = selected.getTime() !== current.getTime();
    if (this.isFutureOrPastDateSelected) this.resetEntry();
    this.loadTimesheetForSelectedWeek();
  }

  isWeekendDateDisabled(date: string): boolean {
    // Disable all Mondays except current
    return new Date(date).getTime() !== new Date(this.currentMondayISO).getTime();
  }

  calculateTotalHours(): void {
    let total = 0;
    this.weekDays.forEach(day => {
      const val = this.timelogEntry.hours?.[day];
      if (val === 'WFO' || val === 'WFH') total += 8;
    });
    this.timelogEntry.totalhours = total;
  }

  toggleAccordion(i: number): void {
    this.accordionState[i] = !this.accordionState[i];
  }

  loadTimelogs(): void {
    this.timelogService.getTimelogs().subscribe(res => {
      const empId = this.timelog.employeeId?.trim().toLowerCase();

      if (this.isAdmin) {
        // Admin sees ALL
        this.timelogSummary = res;
      } else {
        // User sees only their entries (case-insensitive match)
        this.timelogSummary = res.filter(
          e => e.employeeId?.trim().toLowerCase() === empId
        );
        this.latestEntry = this.timelogSummary[0] || null;
      }

      // Always load form for current selection
      this.loadTimesheetForSelectedWeek();
    });
  }

  loadTimesheetForSelectedWeek(): void {
    const empId = this.timelog.employeeId?.trim().toLowerCase();
    const existing = this.timelogSummary.find(e =>
      (this.isAdmin || e.employeeId?.trim().toLowerCase() === empId) &&
      e.weekendDate === this.timelog.weekendDate
    );

    if (existing) {
      this.timelogEntry = { ...existing };
    } else {
      this.resetEntry();
    }
  }

  resetEntry(): void {
    this.timelogEntry = this.getEmptyEntry();
    this.timelogEntry.employeeName = this.timelog.employeeName;
    this.timelogEntry.employeeId = this.timelog.employeeId;
    this.timelogEntry.weekendDate = this.timelog.weekendDate;
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) return alert('Please fill all fields.');
    if (this.isFutureOrPastDateSelected) return alert('Only current week submissions are allowed.');
    this.calculateTotalHours();

    const transformedHours: Hours = {
      monday: this.timelogEntry.hours?.Monday || '',
      tuesday: this.timelogEntry.hours?.Tuesday || '',
      wednesday: this.timelogEntry.hours?.Wednesday || '',
      thursday: this.timelogEntry.hours?.Thursday || '',
      friday: this.timelogEntry.hours?.Friday || ''
    };

    const payload: TimelogEntry = { ...this.timelogEntry, hours: transformedHours };

    this.timelogService.addTimelog(payload).subscribe({
      next: () => {
        alert('Timesheet submitted successfully.');
        this.resetEntry();
        form.resetForm();
        this.setEmployeeDetailsFromToken();
        this.loadTimelogs();
      },
      error: err => {
        console.error(err);
        alert('Failed to submit timesheet.');
      }
    });
  }

  updateTimesheetStatus(entry: TimelogEntry, status: 'Approved' | 'Rejected'): void {
    if (!entry.id) return alert('Invalid entry.');
    this.timelogService.updateTimesheetStatus(entry.id, status).subscribe({
      next: () => {
        alert(`Timesheet ${status}.`);
        this.loadTimelogs();
      },
      error: err => alert('Update failed.')
    });
  }

  private getEmptyEntry(): TimelogEntry {
    return { project: '', hours: { Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '' }, totalhours: 0, description: '', weekendDate: '', employeeName: '', employeeId: '', status: 'Pending' };
  }
}
