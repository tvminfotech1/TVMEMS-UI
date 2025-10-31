import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TimelogService, TimelogEntry, Hours } from './timelog.service';
import { AuthService } from 'src/app/services/auth.service';
import { DateUtilsService } from './date-utils.service';
import { MatSnackBar } from '@angular/material/snack-bar';

type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

@Component({
  selector: 'app-timelog',
  templateUrl: './timelog.component.html',
  styleUrls: ['./timelog.component.css']
})
export class TimelogComponent implements OnInit {

  years: number[] = [];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  weekendDates: string[] = [];
  weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  timelog = { year: new Date().getFullYear(), month: '', weekendDate: '', employeeName: '', employeeId: '' };
  timelogEntry: TimelogEntry = this.getEmptyEntry();
  timelogSummary: TimelogEntry[] = [];
  latestEntry: TimelogEntry | null = null;
  accordionState = [false, false, true];
  isFutureOrPastDateSelected = false;
  currentMondayISO = '';

  isAdmin = false;
  isUser = false;
  entryExistsForWeek = false;

  constructor(
    private timelogService: TimelogService,
    private authService: AuthService,
    private dateUtils: DateUtilsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.setEmployeeDetailsFromToken();
    this.initializeYears();
    this.setCurrentWeek();
    this.resetEntry();
    this.loadTimelogs();
  }

  setEmployeeDetailsFromToken(): void {
    const tokenName = this.authService.getfullName();
    const tokenEmpId = this.authService.getEmployeeId();
    this.timelog.employeeName = tokenName != null ? String(tokenName) : '';
    this.timelog.employeeId = tokenEmpId != null ? String(tokenEmpId) : '';
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
    if (!this.timelog.month) this.timelog.month = this.months[new Date().getMonth()];
    const monthIndex = this.months.indexOf(this.timelog.month);
    this.weekendDates = this.dateUtils.getAllMondaysOfMonth(this.timelog.year, monthIndex);
    if (!this.weekendDates.includes(this.timelog.weekendDate)) this.timelog.weekendDate = this.weekendDates[0] || '';
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
    return new Date(date).getTime() !== new Date(this.currentMondayISO).getTime();
  }

  calculateTotalHours(): void {
    if (!this.timelogEntry.hours) { this.timelogEntry.totalhours = 0; return; }
    const hours = this.normalizeHoursObject(this.timelogEntry.hours);
    let total = 0;
    Object.values(hours).forEach(val => { if (val === 'WFO' || val === 'WFH') total += 8; });
    this.timelogEntry.totalhours = total;
  }

  toggleAccordion(i: number): void { this.accordionState[i] = !this.accordionState[i]; }
  private extractEmployeeIdFromEntry(e: any): string {
    if (!e || typeof e !== 'object') return '';

    if (e.user && typeof e.user === 'object') {
      if (e.user.employeeId != null && e.user.employeeId !== '') return String(e.user.employeeId).trim();
      if (e.user.id != null && e.user.id !== '') return String(e.user.id).trim();
      if (e.user.empId != null && e.user.empId !== '') return String(e.user.empId).trim();
    }

    const candidateKeys = ['employeeId', 'employee_id', 'empId', 'emp_id'];
    for (const k of candidateKeys) {
      if (k in e && e[k] != null && e[k] !== '') return String(e[k]).trim();
    }

    return '';
  }

  private extractEmployeeName(e: any): string {
    if (!e) return '';
    const keys = ['employeeName', 'fullName', 'name', 'employee_name', 'full_name'];
    for (const k of keys) { if (k in e && e[k]) return String(e[k]).trim(); }
    if (e.user && typeof e.user === 'object') {
      if (e.user.fullName) return String(e.user.fullName).trim();
      if (e.user.name) return String(e.user.name).trim();
    }
    return '';
  }

  loadTimelogs(): void {
    this.timelogService.getTimelogs(this.isAdmin).subscribe({
      next: (res: any) => {
        let arr: any[] = [];
        if (Array.isArray(res)) arr = res;
        else if (res?.body && Array.isArray(res.body)) arr = res.body;
        else if (res?.data && Array.isArray(res.data)) arr = res.data;
        else {
          const first = Object.values(res || {}).find(v => Array.isArray(v));
          arr = Array.isArray(first) ? first as any[] : [];
        }

        const normalized: TimelogEntry[] = arr.map((e: any) => {
          const empIdFromExtractor = this.extractEmployeeIdFromEntry(e);
          const empId = empIdFromExtractor || (e.user && e.user.employeeId != null ? String(e.user.employeeId).trim() : '');
          const name = this.extractEmployeeName(e) || 'Unknown';
          const rawWeekend = e.weekendDate ?? e.weekend_date ?? e.weekEndDate ?? '';
          const weekendIso = this.toDateOnlyISO(rawWeekend);

          return {
            ...e,
            id: e.id ?? e.timesheetId ?? e.timesheet_id,
            employeeId: empId,
            employeeName: name,
            weekendDate: weekendIso,
            hours: this.normalizeHoursObject(e.hours),
            totalhours: e.totalhours ?? e.totalHours ?? 0,
            description: e.description ?? '',
            status: (e.status ?? e.Status ?? 'PENDING').toString().trim()
          } as TimelogEntry;
        });

        console.log('[timelog] raw response array length =', arr.length);
        console.log('[timelog] normalized entries (id, employeeId, weekendDate, status) =',
          normalized.map(x => ({ id: x.id, employeeId: x.employeeId, weekendDate: x.weekendDate, status: x.status })));

        const myEmpIdRaw = this.timelog.employeeId ?? this.authService.getEmployeeId();
        const myEmpId = myEmpIdRaw != null ? String(myEmpIdRaw).trim() : '';
        console.log('[timelog] myEmpId (from token/component) =', myEmpId);

        let fetchYear: number | undefined;
        let fetchMonth: string | undefined;
        if (!this.isAdmin) {
          if (!this.timelog.year || !this.timelog.month) {
            this.timelogSummary = [];
            return;
          }
          fetchYear = this.timelog.year;
          fetchMonth = this.timelog.month;
        }

        if (this.isAdmin) {
          this.timelogSummary = normalized.filter(e => (e.status ?? '').toUpperCase() === 'PENDING');
          this.timelogSummary.sort((a, b) => (b.weekendDate || '').localeCompare(a.weekendDate || ''));
          this.latestEntry = null;
          this.entryExistsForWeek = false;
          return;
        } else {
          const sameEmployee = (a?: string, b?: string): boolean => {
            if (!a || !b) return false;
            const na = Number(a);
            const nb = Number(b);
            if (!isNaN(na) && !isNaN(nb)) return na === nb;
            return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
          };
          this.timelogSummary = normalized.filter(e => sameEmployee(e.employeeId, myEmpId));
        }
        const dedupeMap = new Map<string, TimelogEntry>();
        for (const e of this.timelogSummary) {
          const key = (e.weekendDate || '').trim();
          if (!key) continue;
          const existing = dedupeMap.get(key);
          if (!existing) {
            dedupeMap.set(key, e);
          } else {
            const existingId = Number(existing.id) || 0;
            const newId = Number(e.id) || 0;
            if (newId > existingId) dedupeMap.set(key, e);
          }
        }

        this.timelogSummary = Array.from(dedupeMap.values());
        this.timelogSummary.sort((a, b) => (b.weekendDate || '').localeCompare(a.weekendDate || ''));
        const weekIso = this.toDateOnlyISO(this.timelog.weekendDate || this.currentMondayISO);
        const currentWeekEntry = this.timelogSummary.find(e => this.toDateOnlyISO(e.weekendDate) === weekIso);

        if (currentWeekEntry) {
          this.latestEntry = { ...currentWeekEntry };
          console.log('[timelog] latestEntry set to current week entry:', { id: this.latestEntry.id, weekendDate: this.latestEntry.weekendDate });
        } else {
          this.latestEntry = null;
          console.log('[timelog] no entry for current week — latestEntry cleared');
        }

        this.timelogSummary = normalized.filter(e =>
          String(e.employeeId || '').trim() === myEmpId
        );

        this.timelogSummary.sort((a, b) => (b.weekendDate || '').localeCompare(a.weekendDate || ''));
        this.latestEntry = this.timelogSummary[0] || null;
        this.loadTimesheetForSelectedWeek();
        this.resetEntry();
      },
      error: err => {
        console.error('[Timelog] getTimelogs failed:', err);
        this.timelogSummary = [];
        this.latestEntry = null;
      }
    });
  }

  loadTimesheetForSelectedWeek(): void {
    const myEmpId = String(this.timelog.employeeId || '').trim();
    const selectedWeekIso = this.toDateOnlyISO(this.timelog.weekendDate);

    console.log('[timelog] loadTimesheetForSelectedWeek selectedWeekIso=', selectedWeekIso);

    const existing = this.timelogSummary.find(e =>
      (this.isAdmin || String(e.employeeId || '').trim() === myEmpId) &&
      this.toDateOnlyISO(e.weekendDate) === selectedWeekIso
    );

    if (this.isAdmin) {

      this.entryExistsForWeek = true;
      this.resetEntry();
      this.timelogEntry.weekendDate = selectedWeekIso;
      this.latestEntry = null;
      console.log('[timelog] ADMIN mode active. Form disabled and reset.');
      return;
    }

    if (existing) {
      if (!this.isAdmin && String(existing.employeeId || '').trim() === myEmpId) {
        this.entryExistsForWeek = true;
        this.latestEntry = existing; // 
        this.resetEntry();
        this.timelogEntry.employeeName = this.timelog.employeeName;
        this.timelogEntry.employeeId = this.timelog.employeeId;
        this.timelogEntry.weekendDate = this.timelog.weekendDate || this.currentMondayISO;
        this.timelogEntry.hours = { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' };
        this.timelogEntry.totalhours = 0;
        this.calculateTotalHours();
        console.log('[timelog] User already submitted — form disabled for USER');
        return;
      }
    } else {
      this.entryExistsForWeek = false;
      this.resetEntry();
      this.timelogEntry.weekendDate = this.timelog.weekendDate || this.currentMondayISO;
      console.log('[timelog] no entry found for selected week -> form reset');
    }
    const currentWeekEntry = this.timelogSummary.find(e =>
      String(e.employeeId || '').trim() === myEmpId &&
      this.toDateOnlyISO(e.weekendDate) === this.currentMondayISO
    ) || null;
    this.latestEntry = currentWeekEntry;
  }
  

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      }); return;
    }
    if (!this.isAdmin && this.entryExistsForWeek) {
      this.snackBar.open('You have already submitted a timesheet', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.timelogEntry.hours = this.normalizeHoursObject(this.timelogEntry.hours);
    this.calculateTotalHours();
    const canonicalWeekend = this.toDateOnlyISO(this.timelog.weekendDate || this.currentMondayISO);

    const payload: TimelogEntry = {
      ...this.timelogEntry,
      weekendDate: canonicalWeekend,
      status: 'PENDING'
    };

    console.log('[timelog] Submitting payload:', payload);

    this.timelogService.addTimelog(payload).subscribe({
      next: (res) => {
        console.log('[timelog] POST response:', res);
        this.snackBar.open('Timesheet Submitted Sucessfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });

        const saved = res && (res.body ?? res) ? (res.body ?? res) : null;
        if (saved) {
          const savedEntry = this.normalizeSavedEntry(saved);
          console.log('[timelog] savedEntry normalized:', savedEntry);

          const selectedWeekIso = this.toDateOnlyISO(this.timelog.weekendDate || this.currentMondayISO);
          if (this.toDateOnlyISO(savedEntry.weekendDate) === selectedWeekIso &&
            String(savedEntry.employeeId || '').trim() === String(this.timelog.employeeId || '').trim()) {
            this.timelogEntry = { ...savedEntry };
            this.calculateTotalHours();
          } else {
            this.resetEntry();
          }
        } else {
          this.resetEntry();
        }

        this.resetEntry();
        this.loadTimelogs();
        form.resetForm(this.timelogEntry);
      },
      error: err => {
        console.error('[timelog] Submit failed:', err);
        this.snackBar.open('Failed to submit a timesheet.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  updateTimesheetStatus(entry: TimelogEntry, status: 'Approved' | 'Rejected'): void {
    if (!entry?.id) {
      this.snackBar.open('Invalid Entry', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      }); return;
    }

    const before = [...this.timelogSummary];
    this.timelogSummary = this.timelogSummary.filter(e => (e.id ?? 0) !== entry.id);
    if (this.latestEntry?.id === entry.id) this.latestEntry = null;

    const backendStatus = status.toUpperCase();

    this.timelogService.updateTimesheetStatus(entry.id, backendStatus as any).subscribe({
      next: () => {
        this.loadTimelogs();
      },
      error: (err) => {
        console.error('Failed to update timesheet status', err);
        this.snackBar.open('Failed to update timesheet status. Restoring previous state', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        this.timelogSummary = before;
        if (this.timelogSummary.length) this.latestEntry = this.timelogSummary[0];
      }
    });
  }

  resetEntry(): void {
    this.timelogEntry = this.getEmptyEntry();

    this.timelogEntry.employeeName = this.timelog.employeeName;
    this.timelogEntry.employeeId = this.timelog.employeeId;
    this.timelogEntry.weekendDate = this.timelog.weekendDate || this.currentMondayISO;

    this.timelogEntry.project = '';
    this.timelogEntry.hours = { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' };
    this.timelogEntry.totalhours = 0;

    this.calculateTotalHours();
  }

  private getEmptyEntry(): TimelogEntry {
    return {
      project: '',
      hours: { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' },
      totalhours: 0,
      description: '',
      weekendDate: '',
      employeeName: '',
      employeeId: '',
      status: 'PENDING'
    };
  }

  private normalizeHoursObject(h?: any): Hours {
    if (!h) return { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '' };
    const normalized: any = {};
    Object.keys(h).forEach(k => {
      if (!k) return;
      normalized[k.toLowerCase()] = h[k] ?? '';
    });
    return {
      monday: normalized.monday || '',
      tuesday: normalized.tuesday || '',
      wednesday: normalized.wednesday || '',
      thursday: normalized.thursday || '',
      friday: normalized.friday || ''
    };
  }

  private normalizeSavedEntry(saved: any): TimelogEntry {
    return {
      id: saved.id ?? saved.timesheetId ?? saved.timesheet_id,
      project: saved.project ?? '',
      hours: this.normalizeHoursObject(saved.hours),
      totalhours: saved.totalhours ?? saved.totalHours ?? 0,
      description: saved.description ?? '',
      weekendDate: this.toDateOnlyISO(saved.weekendDate ?? saved.weekend_date ?? saved.weekEndDate),
      employeeId: this.extractEmployeeIdFromEntry(saved) || (saved.user && saved.user.employeeId != null ? String(saved.user.employeeId) : ''),
      employeeName: this.extractEmployeeName(saved),
      status: (saved.status ?? saved.Status ?? 'PENDING').toString().trim()
    } as TimelogEntry;
  }
  formatToDDMMYYYY(date: string | Date): string {
  const d = new Date(date);
  return ('0' + d.getDate()).slice(-2) + '-' +
         ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
         d.getFullYear();
}


  private toDateOnlyISO(d?: string | Date | null): string {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    const year = dt.getUTCFullYear();
    const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}