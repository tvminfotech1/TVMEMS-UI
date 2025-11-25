import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { TimelogService, TimelogEntry, Hours } from "./timelog.service";
import { AuthService } from "src/app/services/auth.service";
import { DateUtilsService } from "./date-utils.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LeaveRequest } from "./timelog.service";
import { FormBuilder, FormGroup, FormArray } from "@angular/forms";
interface WeekDayItem {
  name: string;
  date: string;
  attendance?: string;
}

type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

@Component({
  selector: "app-timelog",
  templateUrl: "./timelog.component.html",
  styleUrls: ["./timelog.component.css"],
})
export class TimelogComponent implements OnInit {
  isSubmitting = false;
  wfhDays: string[] = [];
  leaveDays: string[] = [];
  holidayDays: string[] = [];

  years: number[] = [];
  months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  weekendDates: string[] = [];
  weekDays: WeekDayItem[] = [
    { name: "Monday", date: "", attendance: "" },
    { name: "Tuesday", date: "", attendance: "" },
    { name: "Wednesday", date: "", attendance: "" },
    { name: "Thursday", date: "", attendance: "" },
    { name: "Friday", date: "", attendance: "" },
  ];

  accordionStates: { [key: number]: boolean } = {};

  isFormEnabled: boolean = false;
  today: number = new Date().getDay();
  timelog = {
    year: new Date().getFullYear(),
    month: "",
    weekendDate: "",
    employeeName: "",
    employeeId: "",
  };
  timelogEntry: TimelogEntry = this.getEmptyEntry();
  timelogSummary: TimelogEntry[] = [];
  latestEntry: TimelogEntry | null = null;

  allEmployeeTimelogs: TimelogEntry[] = [];
  filteredAllEmployeeTimelogs: TimelogEntry[] = [];
  historyYearFilter: string = "";

  employeeIdSearch: string = "";
  employeeMonthFilter: string = "";

  historyMonthFilter: string = "";
  filteredEmployeeHistory: TimelogEntry[] = [];

  accordionState = [false, false, true];
  isFutureOrPastDateSelected = false;
  currentMondayISO = "";

  isAdmin = false;
  isUser = false;
  entryExistsForWeek = false;
  isLoading: boolean = true;

  selectedEmployeeId: string | null | undefined = null;
  selectedEmployeeName: string | null | undefined = null;
  selectedEmployeeHistory: TimelogEntry[] = [];
  showEmployeeHistory = false;
  selectedMonthYear: string = "";
  monthYearList: string[] = [];
  selectedEmployeeJoiningDate: string = "";
  historyMonths: string[] = [];
  holidayDates: string[] = [];
  disabledDays: any = {};
  timesheetForm: any;

  constructor(
    private timelogService: TimelogService,
    private authService: AuthService,
    private dateUtils: DateUtilsService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}
  async ngOnInit(): Promise<void> {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.setEmployeeDetailsFromToken();
    this.initializeYears();
    this.setCurrentWeek();
    this.timesheetForm = this.fb.group({
      days: this.fb.array(
        this.weekDays.map(() => this.fb.group({ attendance: [""] }))
      ),
    });
    this.resetEntry();
    this.checkFormEnableCondition();
    this.loadHolidays()
      .then(() => this.processHolidayDates())
      .then(() => this.loadApprovedLeaves())
      .then(() => this.loadWFH())
      .then(() => this.loadTimelogs())
      .then(() => this.updateHoursBasedOnPriority())
      .then(() => this.loadWeeklyAttendance());
  }
  getPriority(day: any): string {
    if (day.isHoliday) return "HOLIDAY";
    if (day.isLeave) return "LEAVE";
    if (day.isWFH) return "WFH";
    return "WFO";
  }

  loadWFH(): Promise<void> {
    const employeeId = Number(this.timelog.employeeId);
    return new Promise((resolve) => {
      this.timelogService.getApprovedWFHByEmployee(employeeId).subscribe({
        next: (res) => {
          if (!res || res.length === 0) return resolve();
          this.processWFHDates(res);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  processWFHDates(wfhList: any[]): void {
    this.wfhDays = [];

    const weekStart = new Date(this.timelog.weekendDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 5);

    wfhList.forEach((wfh) => {
      const start = new Date(wfh.fromDate);
      const end = new Date(wfh.toDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateOnly = new Date(d.toDateString());

        if (dateOnly >= weekStart && dateOnly <= weekEnd) {
          const dayName = d
            .toLocaleString("en-US", { weekday: "long" })
            .toLowerCase();

          if (
            ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
              dayName
            )
          ) {
            this.wfhDays.push(dayName);

            if (this.timelogEntry.hours) {
              this.timelogEntry.hours[dayName] = "WFH";
            }
          }
        }
      }
    });

    this.calculateTotalHours();
  }
  loadApprovedLeaves(): Promise<void> {
    return new Promise((resolve) => {
      const employeeId = Number(this.timelog.employeeId);
      const weekStart = new Date(this.timelog.weekendDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 5);

      if (!this.timelogEntry.hours) {
        this.timelogEntry.hours = {
          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          friday: "",
        };
      }

      this.timelogService
        .getApprovedLeavesByEmployee(
          employeeId,
          this.dateUtils.toDateOnlyISO(weekStart),
          this.dateUtils.toDateOnlyISO(weekEnd)
        )
        .subscribe({
          next: (leaves: LeaveRequest[]) => {
            if (leaves && leaves.length > 0) {
              leaves.forEach((leave) => {
                const leaveStart = new Date(leave.startDate);
                const leaveEnd = new Date(leave.endDate);

                for (
                  let d = new Date(leaveStart);
                  d <= leaveEnd;
                  d.setDate(d.getDate() + 1)
                ) {
                  if (d >= weekStart && d <= weekEnd) {
                    const dayName = d
                      .toLocaleString("en-US", { weekday: "long" })
                      .toLowerCase();

                    if (
                      [
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                      ].includes(dayName)
                    ) {
                      if (this.timelogEntry.hours![dayName] !== "HOLIDAY") {
                        this.timelogEntry.hours![dayName] = "LEAVE";
                        this.leaveDays.push(dayName);
                      }
                    }
                  }
                }
              });

              this.calculateTotalHours();
            }

            resolve();
          },

          error: (err) => {
            console.error("Failed to fetch approved leaves", err);
            resolve();
          },
        });
    });
  }

  isLeaveOptionDisabled(day: string): boolean {
    if (!this.timelogEntry.hours) return false;
    const val = this.timelogEntry.hours[day.toLowerCase()];
    return val === "WFH" || val === "Leave";
  }

  setEmployeeDetailsFromToken(): void {
    const tokenName = this.authService.getfullName();
    const tokenEmpId = this.authService.getEmployeeId();
    this.timelog.employeeName = tokenName != null ? String(tokenName) : "";
    this.timelog.employeeId = tokenEmpId != null ? String(tokenEmpId) : "";
    this.timelogEntry.employeeName = this.timelog.employeeName;
    this.timelogEntry.employeeId = this.timelog.employeeId;
  }
  updateTimesheetStatus(
    entry: TimelogEntry,
    status: "Approved" | "Rejected"
  ): void {
    if (!entry?.id) {
      console.warn("Cannot update timesheet: missing ID");
      return;
    }

    this.timelogService.updateTimesheetStatus(entry.id, status).subscribe({
      next: (res) => {
        this.timelogSummary = this.timelogSummary.filter(
          (e) => e.id !== entry.id
        );

        this.snackBar.open(`Timesheet ${status} successfully`, "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
      error: (err) => {
        console.error(`[Timelog] Failed to ${status} timesheet:`, err);
        this.snackBar.open(`Failed to ${status} timesheet`, "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  checkFormEnableCondition() {
    if (this.today === 5 || this.today === 6) {
      this.isFormEnabled = true;
    } else {
      this.isFormEnabled = false;
    }
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
  }

  setCurrentWeek(): void {
    this.currentMondayISO = this.dateUtils.getCurrentMondayISO();
    this.timelog.weekendDate = this.currentMondayISO;
    this.populateWeekDays(this.timelog.weekendDate);

    const mondayDate = new Date(this.currentMondayISO);
    this.timelog.month = this.months[mondayDate.getMonth()];
    this.timelog.year = mondayDate.getFullYear();
    this.onMonthOrYearChange();
  }

  onMonthOrYearChange(): void {
    if (!this.timelog.month)
      this.timelog.month = this.months[new Date().getMonth()];
    const monthIndex = this.months.indexOf(this.timelog.month);
    this.weekendDates = this.dateUtils.getAllMondaysOfMonth(
      this.timelog.year,
      monthIndex
    );
    if (!this.weekendDates.includes(this.timelog.weekendDate))
      this.timelog.weekendDate = this.weekendDates[0] || "";
    this.onWeekendDateSelect();
    setTimeout(() => this.loadWFH(), 50);
  }

  onWeekendDateSelect(): void {
    if (!this.timelog.weekendDate) return;

    const selectedWeekIso = this.dateUtils.toDateOnlyISO(
      this.timelog.weekendDate
    );
    this.populateWeekDays(selectedWeekIso);

    this.loadTimesheetForSelectedWeek();
    this.loadWFH().then(() => this.loadApprovedLeaves());
  }

  isWeekendDateDisabled(date: string): boolean {
    return (
      new Date(date).getTime() !== new Date(this.currentMondayISO).getTime()
    );
  }

  calculateTotalHours(): void {
    if (!this.timelogEntry.hours) {
      this.timelogEntry.totalhours = 0;
      return;
    }
    const hours = this.normalizeHoursObject(this.timelogEntry.hours);
    let total = 0;
    Object.values(hours).forEach((val) => {
      if (val === "WFO" || val === "WFH") total += 8;
    });
    this.timelogEntry.totalhours = total;
  }

  toggleAccordion(i: number): void {
    this.accordionState[i] = !this.accordionState[i];
    this.accordionStates[i] = !this.accordionStates[i];
  }

  private extractEmployeeIdFromEntry(e: any): string {
    if (!e || typeof e !== "object") return "";
    if (e.user && typeof e.user === "object") {
      if (e.user.employeeId != null && e.user.employeeId !== "")
        return String(e.user.employeeId).trim();
      if (e.user.id != null && e.user.id !== "")
        return String(e.user.id).trim();
      if (e.user.empId != null && e.user.empId !== "")
        return String(e.user.empId).trim();
    }
    const candidateKeys = ["employeeId", "employee_id", "empId", "emp_id"];
    for (const k of candidateKeys) {
      if (k in e && e[k] != null && e[k] !== "") return String(e[k]).trim();
    }
    return "";
  }

  private extractEmployeeName(e: any): string {
    if (!e) return "";
    const keys = [
      "employeeName",
      "fullName",
      "name",
      "employee_name",
      "full_name",
    ];
    for (const k of keys) {
      if (k in e && e[k]) return String(e[k]).trim();
    }
    if (e.user && typeof e.user === "object") {
      if (e.user.fullName) return String(e.user.fullName).trim();
      if (e.user.name) return String(e.user.name).trim();
    }
    return "";
  }

  loadTimelogs(): void {
    const empIdRaw =
      this.timelog.employeeId ?? this.authService.getEmployeeId();
    const empIdNum = empIdRaw ? Number(empIdRaw) : 0;

    const obs = this.isAdmin
      ? this.timelogService.getAllTimelogs()
      : this.timelogService.getTimelogsByUserId(empIdNum);

    obs.subscribe({
      next: (res: any) => {
        let arr: any[] = [];
        if (Array.isArray(res)) arr = res;
        else if (res?.body && Array.isArray(res.body)) arr = res.body;
        else if (res?.data && Array.isArray(res.data)) arr = res.data;
        else {
          const first = Object.values(res || {}).find((v) => Array.isArray(v));
          arr = Array.isArray(first) ? (first as any[]) : [];
        }

        const normalized: TimelogEntry[] = arr.map((e: any) => {
          const empIdFromExtractor = this.extractEmployeeIdFromEntry(e);
          const empId =
            empIdFromExtractor ||
            (e.user && e.user.employeeId != null
              ? String(e.user.employeeId).trim()
              : "");
          const name = this.extractEmployeeName(e) || "Unknown";
          const joiningDate =
            e.user?.joiningDate ?? e.joiningDate ?? e.join_date ?? "";
          const rawWeekend =
            e.weekendDate ?? e.weekend_date ?? e.weekEndDate ?? "";
          const weekendIso = this.dateUtils.toDateOnlyISO(rawWeekend);

          return {
            ...e,
            id: e.id ?? e.timesheetId ?? e.timesheet_id,
            employeeId: empId,
            employeeName: name,
            joiningDate: joiningDate
              ? this.dateUtils.toDateOnlyISO(joiningDate)
              : "",
            weekendDate: weekendIso,
            hours: this.normalizeHoursObject(e.hours),
            totalhours: e.totalhours ?? e.totalHours ?? 0,
            description: e.description ?? "",
            status: (e.status ?? e.Status ?? "PENDING").toString().trim(),
          } as TimelogEntry;
        });

        const myEmpIdRaw =
          this.timelog.employeeId ?? this.authService.getEmployeeId();
        const myEmpId = myEmpIdRaw != null ? String(myEmpIdRaw).trim() : "";

        if (this.isAdmin) {
          this.timelogSummary = normalized.filter(
            (e) => (e.status ?? "").toUpperCase() === "PENDING"
          );
          this.timelogSummary.sort((a, b) =>
            (b.weekendDate || "").localeCompare(a.weekendDate || "")
          );

          const employeeMap = new Map<string, TimelogEntry>();

          for (const e of normalized) {
            const empKey = String(e.employeeId || "")
              .trim()
              .toLowerCase();
            if (!empKey) continue;
            const existing = employeeMap.get(empKey);

            if (!existing) {
              employeeMap.set(empKey, e);
            } else {
              const existingDate = new Date(
                existing.weekendDate || ""
              ).getTime();
              const newDate = new Date(e.weekendDate || "").getTime();
              if (newDate > existingDate) {
                employeeMap.set(empKey, e);
              }
            }
          }

          this.allEmployeeTimelogs = Array.from(employeeMap.values()).sort(
            (a, b) => (a.employeeName || "").localeCompare(b.employeeName || "")
          );

          this.filteredAllEmployeeTimelogs = [...this.allEmployeeTimelogs];
          const first = this.allEmployeeTimelogs[0];
          return;
        }

        const sameEmployee = (a?: string, b?: string): boolean => {
          if (!a || !b) return false;
          const na = Number(a);
          const nb = Number(b);
          if (!isNaN(na) && !isNaN(nb)) return na === nb;
          return (
            String(a).trim().toLowerCase() === String(b).trim().toLowerCase()
          );
        };

        this.timelogSummary = normalized.filter((e) =>
          sameEmployee(e.employeeId, myEmpId)
        );

        const dedupeMap = new Map<string, TimelogEntry>();
        for (const e of this.timelogSummary) {
          const key = (e.weekendDate || "").trim();
          if (!key) continue;
          const existing = dedupeMap.get(key);
          if (!existing) dedupeMap.set(key, e);
          else {
            const existingId = Number(existing.id) || 0;
            const newId = Number(e.id) || 0;
            if (newId > existingId) dedupeMap.set(key, e);
          }
        }

        this.timelogSummary = Array.from(dedupeMap.values());
        this.timelogSummary.sort((a, b) =>
          (b.weekendDate || "").localeCompare(a.weekendDate || "")
        );
        this.loadTimesheetForSelectedWeek();
      },
      error: (err) => {
        console.error("[Timelog] getTimelogs failed:", err);
        this.timelogSummary = [];
        this.latestEntry = null;
      },
    });
  }

  applyFilters(): void {
    const idTerm = (this.employeeIdSearch || "").trim().toLowerCase();
    const month = (this.employeeMonthFilter || "").trim();
    const filterValue = this.selectedMonthYear;
    this.filteredAllEmployeeTimelogs = this.allEmployeeTimelogs.filter(
      (entry) => {
        const employeeId = entry.employeeId
          ? entry.employeeId.toString().toLowerCase()
          : "";
        const employeeName = entry.employeeName
          ? entry.employeeName.toLowerCase()
          : "";

        const matchesIdOrName =
          !idTerm ||
          employeeId.includes(idTerm) ||
          employeeName.includes(idTerm);

        const entryDate = entry.weekendDate
          ? new Date(entry.weekendDate)
          : null;

        const entryMonth = entryDate
          ? entryDate.toLocaleString("default", { month: "long" })
          : "";

        const entryYear = entryDate ? entryDate.getFullYear() : null;

        const entryMonthYear =
          entryMonth && entryYear ? `${entryMonth} ${entryYear}` : "";
        const matchesMonthYear = !filterValue || entryMonthYear === filterValue;

        return matchesIdOrName && matchesMonthYear;
      }
    );
  }

  viewEmployeeHistory(entry: any): void {
    if (!entry?.employeeId) return;

    this.selectedEmployeeHistory = [];
    this.filteredEmployeeHistory = [];
    this.historyMonthFilter = "";
    this.selectedEmployeeJoiningDate = entry.joiningDate
      ? this.dateUtils.toDateOnlyISO(entry.joiningDate)
      : "";
    this.generateYearsFromJoining(this.selectedEmployeeJoiningDate);

    this.selectedEmployeeName = entry.employeeName;
    this.selectedEmployeeId = entry.employeeId;

    this.timelogService.getAllTimelogs().subscribe({
      next: (res: any) => {
        let arr: any[] = [];
        if (Array.isArray(res)) arr = res;
        else if (res?.body && Array.isArray(res.body)) arr = res.body;
        else if (res?.data && Array.isArray(res.data)) arr = res.data;
        else {
          const first = Object.values(res || {}).find((v) => Array.isArray(v));
          arr = Array.isArray(first) ? (first as any[]) : [];
        }

        const filtered = arr.filter(
          (e: any) =>
            String(e.user?.employeeId || e.employeeId).trim() ===
            String(entry.employeeId).trim()
        );

        this.selectedEmployeeHistory = filtered.map((e) => ({
          weekendDate: e.weekendDate ?? e.weekend_date ?? e.weekEndDate ?? "",
          project: e.project ?? "",
          totalhours: e.totalhours ?? e.totalHours ?? 0,
          description: e.description ?? "",
          status: (e.status ?? e.Status ?? "PENDING").toString().trim(),
        }));

        this.selectedEmployeeHistory.sort((a, b) =>
          (b.weekendDate || "").localeCompare(a.weekendDate || "")
        );
        this.filteredEmployeeHistory = [...this.selectedEmployeeHistory];
      },
      error: (err) => {
        console.error("[Timelog] Failed to fetch employee history:", err);
        this.selectedEmployeeHistory = [];
        this.filteredEmployeeHistory = [];
      },
    });
  }

  applyMonthFilter(): void {
    if (!this.historyMonthFilter) {
      this.filteredEmployeeHistory = [...this.selectedEmployeeHistory];
      return;
    }

    this.filteredEmployeeHistory = this.selectedEmployeeHistory.filter((e) => {
      const monthName = e.weekendDate
        ? new Date(e.weekendDate).toLocaleString("default", { month: "long" })
        : "";
      return monthName === this.historyMonthFilter;
    });
  }
  applyHistoryMonthFilter(): void {
    const selectedMonth = this.historyMonthFilter;
    const selectedYear = this.historyYearFilter;
    this.filteredEmployeeHistory = this.selectedEmployeeHistory.filter((e) => {
      if (!e.weekendDate) return false;
      const entryDate = new Date(e.weekendDate);
      const joiningDate = new Date(this.selectedEmployeeJoiningDate);
      if (
        joiningDate &&
        !isNaN(joiningDate.getTime()) &&
        entryDate < joiningDate
      )
        return false;

      if (!entryDate || isNaN(entryDate.getTime())) return false;
      const entryMonth = entryDate.toLocaleString("default", { month: "long" });
      const entryYear = entryDate.getFullYear().toString();

      const matchMonth = !selectedMonth || entryMonth === selectedMonth;
      const matchYear = !selectedYear || entryYear === selectedYear;

      return matchMonth && matchYear;
    });
  }
  onHistoryYearChange(): void {
    if (!this.historyYearFilter) {
      this.historyMonths = [...this.months];
      this.applyHistoryMonthFilter();
      return;
    }

    const selectedYear = Number(this.historyYearFilter);

    this.updateMonthsForYear(selectedYear);
  }

  loadTimesheetForSelectedWeek(): void {
    const myEmpId = String(this.timelog.employeeId || "").trim();
    const selectedWeekIso = this.dateUtils.toDateOnlyISO(
      this.timelog.weekendDate
    );

    const existing = this.timelogSummary.find(
      (e) =>
        (this.isAdmin || String(e.employeeId || "").trim() === myEmpId) &&
        this.dateUtils.toDateOnlyISO(e.weekendDate) === selectedWeekIso
    );

    if (existing) {
      this.timelogEntry = existing;
      Object.assign(this.timelogEntry, existing);
      this.entryExistsForWeek = existing.status?.toLowerCase() !== "rejected";
    } else {
      this.entryExistsForWeek = false;
      this.timelogEntry = this.getEmptyEntry();
    }
    this.timelogEntry.employeeName = this.timelog.employeeName;
    this.timelogEntry.employeeId = this.timelog.employeeId;
    this.timelogEntry.weekendDate = selectedWeekIso;
    this.calculateTotalHours();
    this.processHolidayDates();
    this.updateHoursBasedOnPriority();
    this.loadWeeklyAttendance();
    if (this.timesheetForm) {
      this.timesheetForm.patchValue(this.timelogEntry.hours);
    }
  }

  loadHolidays(): Promise<void> {
    return new Promise((resolve) => {
      this.timelogService.getAllHolidays().subscribe({
        next: (res: any[]) => {
          this.holidayDates = res
            .map((h) => h.date ?? null)
            .filter((d): d is string => d !== null);
          resolve();
        },
        error: (err) => {
          console.error("Failed to fetch holidays", err);
          this.holidayDates = [];
          resolve();
        },
      });
    });
  }

  onSubmit(form: NgForm): void {
    if (this.isSubmitting) return;
    if (!form.valid) {
      this.snackBar.open("Please fill all required fields", "Close", {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
      return;
    }
    if (!this.isAdmin && this.entryExistsForWeek) {
      this.snackBar.open("You have already submitted a timesheet", "Close", {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
      return;
    }
    this.isSubmitting = true;

    this.timelogEntry.hours = this.normalizeHoursObject(
      this.timelogEntry.hours
    );
    this.calculateTotalHours();
    const canonicalWeekend = this.dateUtils.toDateOnlyISO(
      this.timelog.weekendDate || this.currentMondayISO
    );

    const payload: TimelogEntry = {
      ...this.timelogEntry,
      weekendDate: canonicalWeekend,
      status: "PENDING",
    };

    this.timelogService.addTimelog(payload).subscribe({
      next: (res) => {
        this.snackBar.open("Timesheet Submitted Successfully", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
        this.resetEntry();
        this.loadTimelogs();
        form.resetForm(this.timelogEntry);
      },
      error: () => {
        this.snackBar.open("Failed to submit a timesheet.", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
        this.isSubmitting = false;
      },
    });
  }

  resetEntry(): void {
    this.timelogEntry = this.getEmptyEntry();
    this.timelogEntry.employeeName = this.timelog.employeeName;
    this.timelogEntry.employeeId = this.timelog.employeeId;
    this.timelogEntry.weekendDate =
      this.timelog.weekendDate || this.currentMondayISO;
    this.timelogEntry.project = "";
    this.timelogEntry.hours = {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
    };
    this.timelogEntry.totalhours = 0;
    this.calculateTotalHours();
  }
  closeEmployeeHistory(): void {
    this.selectedEmployeeHistory = [];
    this.filteredEmployeeHistory = [];
    this.selectedEmployeeId = null;
    this.selectedEmployeeName = null;
    this.showEmployeeHistory = false;
  }

  private getEmptyEntry(): TimelogEntry {
    return {
      project: "",
      hours: {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
      },
      totalhours: 0,
      description: "",
      weekendDate: "",
      employeeName: "",
      employeeId: "",
      status: "PENDING",
    };
  }

  private normalizeHoursObject(h?: any): Hours {
    if (!h)
      return {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
      };
    const normalized: any = {};
    Object.keys(h).forEach((k) => {
      if (!k) return;
      normalized[k.toLowerCase()] = h[k] ?? "";
    });
    return {
      monday: normalized.monday || "",
      tuesday: normalized.tuesday || "",
      wednesday: normalized.wednesday || "",
      thursday: normalized.thursday || "",
      friday: normalized.friday || "",
    } as Hours;
  }
  generateYearsFromJoining(joiningDate: string) {
    if (!joiningDate) return;

    const jd = new Date(joiningDate);
    if (isNaN(jd.getTime())) return;

    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let y = jd.getFullYear(); y <= currentYear; y++) {
      this.years.push(y);
    }
    this.historyYearFilter = currentYear.toString();
    this.updateMonthsForYear(currentYear, jd);
  }

  updateMonthsForYear(selectedYear: number, joiningDate?: Date) {
    if (!joiningDate) {
      joiningDate = new Date(this.selectedEmployeeJoiningDate);
      if (isNaN(joiningDate.getTime())) return;
    }
    const now = new Date();
    const currentYear = now.getFullYear();

    let startMonth = 0;
    let endMonth = 11;
    if (selectedYear === joiningDate.getFullYear()) {
      startMonth = joiningDate.getMonth();
    }
    if (selectedYear === currentYear) {
      endMonth = now.getMonth();
    }
    this.historyMonths = this.months.slice(startMonth, endMonth + 1);
    if (
      !this.historyMonthFilter ||
      !this.historyMonths.includes(this.historyMonthFilter)
    ) {
      this.historyMonthFilter = "";
    }
    this.applyHistoryMonthFilter();
  }
  processHolidayDates(): void {
    if (!this.holidayDates || this.holidayDates.length === 0) return;

    this.holidayDates.forEach((holidayISO) => {
      this.weekDays.forEach((day, index) => {
        const localISO = this.toLocalDateOnlyISO(day.date);
        if (localISO === holidayISO) {
          const dayName = day.name.toLowerCase();
          this.timelogEntry.hours![dayName] = "HOLIDAY";
          this.weekDays[index].attendance = "HOLIDAY";
          this.disableDayHoursField(dayName);
        }
      });
    });
    if (this.timesheetForm && this.timesheetForm.get("days")) {
      const daysArray = this.timesheetForm.get("days") as FormArray;
      this.weekDays.forEach((day, index) => {
        daysArray.at(index).patchValue({
          attendance: this.timelogEntry.hours![day.name.toLowerCase()] || "",
        });
      });
    }

    this.calculateTotalHours();
  }

  updateHoursBasedOnPriority(): void {
    this.timelogEntry.hours?.["thursday"];
    const weekStartISO = this.timelog.weekendDate;
    for (let i = 0; i < 5; i++) {
      const currentDay = new Date(weekStartISO);
      currentDay.setDate(currentDay.getDate() + i);
      const dayName = this.weekDays[i].name.toLowerCase();
      const currentStatus = this.timelogEntry.hours![dayName];
      const dateISO = this.dateUtils.toDateOnlyISO(currentDay);
      if (currentStatus === "HOLIDAY" || currentStatus === "Leave") {
        return;
      }
      let finalStatus = "";
      if (this.holidayDates.includes(dateISO)) {
        finalStatus = "Holiday";
      } else if (this.leaveDays.includes(dayName)) {
        finalStatus = "Leave";
      } else if (this.wfhDays.includes(dayName)) {
        finalStatus = "WFH";
      }
      if (this.timelogEntry.hours) {
        (this.timelogEntry.hours as any)[dayName] = finalStatus;
      }
    }
    this.calculateTotalHours();
    if (this.timesheetForm) {
      this.timesheetForm.patchValue(this.timelogEntry.hours);
    }
  }
  loadWeeklyAttendance(): Promise<void> {
    const employeeId = Number(this.timelog.employeeId);
    const weekStartStr = this.dateUtils.toDateOnlyISO(
      this.timelog.weekendDate || this.currentMondayISO
    );
    if (!this.timelogEntry) this.timelogEntry = this.getEmptyEntry();
    if (!this.timelogEntry.hours) {
      this.timelogEntry.hours = {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
      };
    }
    return new Promise((resolve) => {
      this.timelogService
        .getWeeklyAttendance(employeeId, weekStartStr)
        .subscribe({
          next: (records: any[]) => {
            this.patchAttendanceToWeek(records || []);
            resolve();
          },
          error: (err) => {
            console.error("Failed to load weekly attendance", err);
            resolve();
          },
        });
    });
  }

  patchAttendanceToWeek(attendance: any[]) {
    attendance.forEach((record) => {
      const apiDate = record.date;
      const dateISO = this.dateUtils.toDateOnlyISO(apiDate);
      const dayIndex = this.weekDays.findIndex(
        (day) => this.dateUtils.toDateOnlyISO(day.date) === dateISO
      );

      if (dayIndex !== -1) {
        const dayName = this.weekDays[dayIndex].name.toLowerCase();
        const currentStatus = (this.timelogEntry.hours as any)[dayName];
        const isHighPriorityStatus =
          currentStatus === "HOLIDAY" ||
          currentStatus === "LEAVE" ||
          currentStatus === "WFH";
        if (record.entryTime && !isHighPriorityStatus) {
          this.weekDays[dayIndex].attendance = "WFO";
          (this.timelogEntry.hours as any)[dayName] = "WFO";
        }
      }
    });
    this.calculateTotalHours();
  }
  disableDayHoursField(day: string) {
    this.disabledDays[day] = true;
  }
  enableDayHoursField(day: string) {
    this.disabledDays[day] = false;
  }
  populateWeekDays(mondayDateISO: string) {
    const [year, month, day] = mondayDateISO.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = start.getUTCDay();
    if (dayOfWeek === 0) {
      start.setUTCDate(start.getUTCDate() + 1);
    }
    for (let i = 0; i < this.weekDays.length; i++) {
      const d = new Date(start);

      d.setUTCDate(start.getUTCDate() + i);
      (this.weekDays[i] as any).date = this.dateUtils.toDateOnlyISO(d);
      (this.weekDays[i] as any).attendance = "";
    }
    if (this.timesheetForm && this.timesheetForm.get("days")) {
      const arr = this.fb.array(
        this.weekDays.map(() => this.fb.group({ attendance: [""] }))
      );
      this.timesheetForm.setControl("days", arr);
    }
  }

  public toLocalDateOnlyISO(d?: string | Date | null): string {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}