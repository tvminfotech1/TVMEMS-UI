import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { LeaveService, newLeaveRequest } from "src/app/services/leave.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserlistService } from "src/app/services/admin.service";

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  carryOver: number;
}
interface Holiday {
  id: number;
  name: string;
  date: string;
  day_Name: string;
}

@Component({
  selector: "app-leave",
  templateUrl: "./leave.component.html",
  styleUrls: ["./leave.component.css"],
})
export class LeaveComponent implements OnInit {
  isAdmin = false;
  isUser = false;
  employeeId = "";
  showApplyLeaveModal = false;
  showCompOffModal = false;
  activeTab: "leave" | "compoff" = "leave";
  isEmployeeValid: boolean = false;

  leaveForm!: FormGroup;
  allUsers: any[] = [];
  employeeSearch: string = "";
  employeeSuggestions: any[] = [];
  leaveList: newLeaveRequest[] = [];
  filteredRequests: newLeaveRequest[] = [];
  holidays: Date[] = [];
  fixedmonth: Date = new Date();
  leaveRequests: newLeaveRequest[] = [];
  joiningDate!: Date;
  currentUserId: string = "";
  sortColumn: keyof newLeaveRequest | "" = "";
  sortKey: string = "";
  sortDirection: "asc" | "desc" = "asc";
  searchTerm = "";
  statusFilter = "";
  currentPage = 1;
  itemsPerPage = 5;

  leaveBalances: LeaveBalance[] = [
    { leaveType: "Casual Leave", total: 12, used: 0, carryOver: 0 },
    { leaveType: "Sick Leave", total: 10, used: 0, carryOver: 0 },
  ];

  leaveCards: any[] = [];
  selectedDate: Date = new Date();
  selectedEmployee: any = null;

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private UserlistService: UserlistService
  ) {}
  private lastUpdatedMonth = new Date().getMonth();

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.logout();
      return;
    }
    this.employeeId = this.authService.getEmployeeId() || "";
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.currentUserId = String(
      this.authService.getEmployeeId() ??
        sessionStorage.getItem("employeeId") ??
        ""
    );
    this.loadLeaves();
    this.loadHolidays();

    this.UserlistService.getAllUser().subscribe({
      next: (res) => {
        this.allUsers = res.body || [];
      },
      error: (error) => console.error("Failed to load user list", error),
    });

    this.initForms();
      if (this.isAdmin) {
    this.leaveForm.get("employeeId")?.valueChanges.subscribe(() => {
      this.validateEmployeeId();
    });
  }
    this.checkYearEndReset();
    const today = new Date();
    this.selectedDate = new Date(today.getFullYear(), today.getMonth(), 1);

    setTimeout(() => this.applyFilters(), 200);

    this.updateLeaveCards();

    setInterval(() => {
      const currentMonth = new Date().getMonth();
      if (currentMonth !== this.lastUpdatedMonth) {
        this.lastUpdatedMonth = currentMonth;
        this.calculateLeaveBalances();
      }
    }, 86400000);
  }

  private initForms(): void {
    this.leaveForm = this.fb.group({
      leaveType: ["", Validators.required],
      employeeId: [
        { value: this.employeeId, disabled: !this.isAdmin },
        this.isAdmin ? [Validators.required] : [],
      ],
      startDate: [null, Validators.required],
      endDate: [
        null,
        [Validators.required, this.endDateAfterStartDateValidator.bind(this)],
      ],
      reason: ["", [Validators.required, Validators.minLength(5)]],
    });

    this.leaveForm.get("startDate")?.valueChanges.subscribe(() => {
      this.leaveForm.get("endDate")?.updateValueAndValidity();
    });
    if (this.isAdmin) {
  this.leaveForm.get("leaveType")?.disable();
  this.leaveForm.get("startDate")?.disable();
  this.leaveForm.get("endDate")?.disable();
  this.leaveForm.get("reason")?.disable();
}

  }

  loadLeaves(): void {
    const obs = this.isAdmin
      ? this.leaveService.getAllLeaveRequests()
      : this.leaveService.getLeaveByEmployeeId(Number(this.employeeId));

    obs.subscribe({
      next: (res) => {
        const leaveArray = Array.isArray(res) ? res : res.body ?? [];
        this.leaveRequests = leaveArray;
        this.processLeaveResponse(leaveArray);
        if (!this.isAdmin && leaveArray.length > 0) {
          const first = leaveArray[0];
          if (first?.user?.joiningDate) {
            this.joiningDate = new Date(first.user.joiningDate);
          }
        }
      },

      error: (err) => {
        console.error("Error fetching leave requests:", err);
      },
    });
  }

  private processLeaveResponse(res: any[]): void {
    const data: any[] = res ?? [];

    this.leaveList = data.map((l) => {
      const totalDays =
        l.totalDays ?? this.calculateDays(l.startDate, l.endDate);

      return {
        id: l.id,
        leaveType: l.leaveType,
        startDate: l.startDate,
        endDate: l.endDate,
        reason: l.reason,
        status: this.formatStatus(l.status),
        duration: `${totalDays} days`,
        totalDays,
        user: {
          employeeId: l.user?.employeeId ?? l.employeeId,
        },
      } as newLeaveRequest;
    });

    this.applyFilters();
    this.calculateLeaveBalances();
    this.updateLeaveCards();
  }

  onSubmit(): void {
    this.leaveForm.markAllAsTouched();

    if (!this.leaveForm.valid) {
      this.snackBar.open("Please fill all required fields", "Close", {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      });
      return;
    }

    const formValue = this.leaveForm.getRawValue();
    const leaveType = formValue.leaveType;

    let selectedEmployeeId: number;
    if (this.isAdmin) {
      selectedEmployeeId = Number(formValue.employeeId);
      if (!selectedEmployeeId) {
        this.snackBar.open("Please enter a valid Employee ID", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
        return;
      }
      if (selectedEmployeeId === Number(this.isAdmin)) {
        this.snackBar.open(
          "Admins cannot apply leave for themselves.",
          "Close",
          {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          }
        );
        return;
      }
    } else {
      selectedEmployeeId = Number(this.employeeId);
    }

    const startDate: Date = formValue.startDate;
    const endDate: Date = formValue.endDate;

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const totalDays = this.calculateDays(startDate, endDate);

    const leaveBalance = this.leaveBalances.find(
      (lb) => lb.leaveType === leaveType
    );
    if (leaveBalance) {
      const available =
        leaveBalance.total - leaveBalance.used + leaveBalance.carryOver;
      if (available < totalDays) {
        this.snackBar.open(
          `You only have ${available} ${leaveType} days available, cannot apply for ${totalDays} days.`,
          "Close",
          {
            duration: 4000,
            horizontalPosition: "center",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          }
        );
        return;
      }
    }
    const sameMonthConflict = this.leaveList.some((l) => {
      if (l.user?.employeeId !== selectedEmployeeId) return false;
      const existingStart = new Date(l.startDate);
      const sameType = l.leaveType === leaveType;
      const sameMonth =
        existingStart.getMonth() === startDate.getMonth() &&
        existingStart.getFullYear() === startDate.getFullYear();
      const isRejected = (l.status || "").toLowerCase() === "rejected";
      return sameType && sameMonth && !isRejected;
    });

    if (sameMonthConflict) {
      this.snackBar.open(
        `You already have applied ${leaveType} for this month.`,
        "Close",
        {
          duration: 4000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        }
      );
      return;
    }

    const overlappingConflict = this.leaveList.some((l) => {
      if (l.user?.employeeId !== selectedEmployeeId) return false;

      const normalize = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const start = normalize(new Date(startDate));
      const end = normalize(new Date(endDate));
      const existingStart = normalize(new Date(l.startDate));
      const existingEnd = normalize(new Date(l.endDate));

      const overlaps = start <= existingEnd && end >= existingStart;
      const isRejected = (l.status || "").toLowerCase() === "rejected";

      return overlaps && !isRejected;
    });

    if (overlappingConflict) {
      this.snackBar.open(
        "You already have a pending or approved leave for these dates.",
        "Close",
        {
          duration: 4000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        }
      );
      return;
    }

    const newLeave: newLeaveRequest = {
      id: undefined,
      leaveType,
      startDate: startDateStr,
      endDate: endDateStr,
      reason: formValue.reason,
      status: "Pending",
      totalDays,
      duration: `${totalDays} days`,
      user: {
        employeeId: selectedEmployeeId,
        fullName: "",
        mobile: "",
        email: "",
        aadhar: "",
      } as any,
    };

    this.leaveService.createLeaveRequest(newLeave).subscribe({
      next: () => {
        this.loadLeaves();
        this.snackBar.open("Leave applied successfully", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["success-snackbar"],
        });
        this.closeApplyLeaveModal();
        this.resetApplyLeaveForm();
        this.calculateLeaveBalances();
      },
      error: (err) => {
        console.error("Error applying leave:", err);
        this.snackBar.open("error apllying leave", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  calculateDays(start: string | Date, end: string | Date): number {
    const s = start instanceof Date ? start : new Date(start);
    const e = end instanceof Date ? end : new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  approveRequest(id?: number): void {
    if (!id) return;
    const request = this.leaveList.find((l) => l.id === id);
    if (
      request &&
      String(request.user?.employeeId) === String(this.currentUserId)
    ) {
      alert("You cannot approve or reject your own leave request.");
      return;
    }

    this.leaveService.updateLeaveStatus(id, "APPROVED").subscribe({
      next: () => {
        const request = this.leaveList.find((l) => l.id === id);
        if (!request) return;

        request.status = "Approved";

        const balance = this.leaveBalances.find(
          (lb) => lb.leaveType === request.leaveType
        );
        if (balance) balance.used += request.totalDays ?? 0;
        this.calculateLeaveBalances();
        this.updateLeaveCards();
        this.applyFilters();
        this.loadLeaves();
      },
      error: (err) => console.error("Error approving leave:", err),
    });
  }

  rejectRequest(id?: number): void {
    if (!id) return;
    const request = this.leaveList.find((l) => l.id === id);
    if (
      request &&
      String(request.user?.employeeId) === String(this.currentUserId)
    ) {
      alert("You cannot approve or reject your own leave request.");
      return;
    }

    this.leaveService.updateLeaveStatus(id, "REJECTED").subscribe({
      next: () => {
        const request = this.leaveList.find((l) => l.id === id);
        if (request) request.status = "Rejected";
        this.applyFilters();
        this.calculateLeaveBalances();
        this.loadLeaves();
      },
      error: (err) => console.error("Error rejecting leave:", err),
    });
  }

  private calculateLeaveBalances(): void {
    const currentYear = new Date().getFullYear();

    this.leaveBalances.forEach((lb) => {
      const used = this.leaveList
        .filter((l) => {
          const leaveYear = new Date(l.startDate).getFullYear();

          return (
            l.leaveType === lb.leaveType &&
            l.status === "Approved" &&
            leaveYear === currentYear &&
            (!this.isAdmin || l.user?.employeeId === Number(this.employeeId))
          );
        })
        .reduce((sum, l) => sum + (l.totalDays ?? 0), 0);

      lb.used = used;
    });
  }

  resetApplyLeaveForm(): void {
    this.leaveForm.reset({
      employeeId: this.isAdmin ? "" : this.employeeId,
    });
  }

  endDateAfterStartDateValidator(control: AbstractControl) {
    if (!this.leaveForm) return null;
    const start = this.leaveForm.get("startDate")?.value;
    const end = control.value;
    if (!start || !end) return null;
    return new Date(end) < new Date(start) ? { endBeforeStart: true } : null;
  }

  formatStatus(status: string): string {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "Pending";
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return status;
  }

  updateLeaveCards(): void {
    this.leaveCards = this.leaveBalances.map((lb) => {
      const available = lb.total - lb.used + lb.carryOver;
      return {
        title: lb.leaveType,
        total: lb.total,
        used: lb.used,
        carryOver: lb.carryOver,
        available: available < 0 ? 0 : available,
        icon: this.getLeaveIcon(lb.leaveType),
        color: this.getLeaveColor(lb.leaveType),
      };
    });
  }

  private normalize(date: Date | string): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    const leaveType = this.leaveForm.get("leaveType")?.value;
    const today = this.normalize(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 6);

    const d = this.normalize(date);

    const isHoliday = this.holidays.some(
      (h) => this.normalize(h).getTime() === d.getTime()
    );
    if (isHoliday) return false;

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    switch (leaveType) {
      case "Sick Leave":
        return (
          d.getTime() === today.getTime() || d.getTime() === yesterday.getTime()
        );

      case "Casual Leave":
        return d >= today && d <= maxDate && !isWeekend;

      default:
        return true;
    }
  };

  endDateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    const leaveType = this.leaveForm.get("leaveType")?.value;
    const startDateValue = this.leaveForm.get("startDate")?.value;
    if (!startDateValue) return false;

    const start = this.normalize(startDateValue);
    const end = this.normalize(date);

    if (end.getDay() === 0) return false;

    const isHoliday = this.holidays.some(
      (h) => this.normalize(h).getTime() === end.getTime()
    );
    if (isHoliday) return false;

    let maxDays = 0;
    switch (leaveType) {
      case "Sick Leave":
      case "Casual Leave":
        maxDays = 1;
        break;
      default:
        maxDays = 10;
    }

    const maxEndDate = new Date(start);
    maxEndDate.setDate(start.getDate() + (maxDays - 1));
    maxEndDate.setHours(0, 0, 0, 0);

    return end >= start && end <= maxEndDate;
  };

  getLeaveIcon(type: string) {
    switch (type) {
      case "Casual Leave":
        return "fas fa-calendar-day";
      case "Sick Leave":
        return "fas fa-user-injured";
      default:
        return "fas fa-calendar";
    }
  }

  getLeaveColor(type: string) {
    switch (type) {
      case "Casual Leave":
        return "bg-info";
      case "Sick Leave":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  }
  private checkYearEndReset(): void {
    const currentYear = new Date().getFullYear();
    const storedYear = Number(sessionStorage.getItem("leaveLastResetYear"));

    if (storedYear !== currentYear) {
      this.leaveBalances.forEach((lb) => {
        lb.total = lb.leaveType === "Casual Leave" ? 12 : 10;
        lb.used = 0;
        lb.carryOver = 0;
      });

      this.updateLeaveCards();
      this.calculateLeaveBalances();

      sessionStorage.setItem("leaveLastResetYear", String(currentYear));
    }

    setInterval(() => {
      const now = new Date();
      if (now.getMonth() === 0 && now.getDate() === 1) {
        const lastResetYear = Number(
          sessionStorage.getItem("leaveLastResetYear")
        );
        if (lastResetYear !== now.getFullYear()) {
          this.leaveBalances.forEach((lb) => {
            lb.total = lb.leaveType === "Casual Leave" ? 12 : 10;
            lb.used = 0;
            lb.carryOver = 0;
          });

          this.updateLeaveCards();
          this.calculateLeaveBalances();

          sessionStorage.setItem(
            "leaveLastResetYear",
            String(now.getFullYear())
          );
        }
      }
    }, 86400000);
  }

  openApplyLeaveModal(): void {
    this.resetApplyLeaveForm();
    this.showApplyLeaveModal = true;
  }
  closeApplyLeaveModal(): void {
    this.showApplyLeaveModal = false;
  }

  applyFilters(): void {
    const term = (this.searchTerm || "").toLowerCase().trim();

    const month = this.selectedDate.getMonth();
    const year = this.selectedDate.getFullYear();

    this.filteredRequests = this.leaveList.filter((req) => {
      const d = new Date(req.startDate);
      d.setHours(0, 0, 0, 0);
      const matchesMonth = d.getMonth() === month && d.getFullYear() === year;
      const matchesJoining = !this.joiningDate || d >= this.joiningDate;
      const matchesStatus = this.statusFilter
        ? req.status.toLowerCase() === this.statusFilter.toLowerCase()
        : true;

      const matchesSearch =
        !term ||
        [
          req.leaveType,
          req.duration,
          req.reason,
          req.status,
          req.startDate,
          req.endDate,
          req.user?.employeeId,
        ].some((v) => String(v).toLowerCase().includes(term));

      return matchesMonth && matchesJoining && matchesStatus && matchesSearch;
    });

    this.filteredRequests.sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (a.status !== "Pending" && b.status === "Pending") return 1;
      return 0;
    });
  }

  get paginatedRequests(): newLeaveRequest[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredRequests.length / this.itemsPerPage)
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  getLeaveTypeBadgeClass(type?: string): string {
    switch (type) {
      case "Earned Leave":
        return "leave-type-badge leave-earned";
      case "Sick Leave":
        return "leave-type-badge leave-sick";
      default:
        return "leave-type-badge";
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case "Approved":
        return "status-badge status-approved";
      case "Rejected":
        return "status-badge status-rejected";
      case "Pending":
        return "status-badge status-pending";
      default:
        return "status-badge";
    }
  }

  switchTab(tab: "leave" | "compoff"): void {
    this.activeTab = tab;
    this.loadLeaves();
    this.calculateLeaveBalances();
    this.updateLeaveCards();
  }
  formatDateRange(): string {
    const date = new Date(this.selectedDate);
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    return `${first.toLocaleDateString(
      "en-US",
      options
    )} - ${last.toLocaleDateString("en-US", options)}`;
  }
  leavemonth() {
    const date = new Date(this.fixedmonth);
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    return `${first.toLocaleDateString(
      "en-US",
      options
    )} - ${last.toLocaleDateString("en-US", options)}`;
  }

  goToPreviousMonth(): void {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() - 1);

    if (this.joiningDate) {
      const limit = new Date(
        this.joiningDate.getFullYear(),
        this.joiningDate.getMonth(),
        1
      );
      if (d < limit) return;
    }

    this.selectedDate = d;
    this.applyFilters();
  }

  goToNextMonth(): void {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() + 1);

    this.selectedDate = d;
    this.applyFilters();
  }

  loadHolidays() {
    this.leaveService.getHolidays().subscribe({
      next: (res: Holiday[]) => {
        this.holidays = res
          .map((h: Holiday) => {
            const d = new Date(h.date);
            return isNaN(d.getTime()) ? null : d;
          })
          .filter((d): d is Date => d !== null);
      },
      error: (err) => console.error("Holiday load failed", err),
    });
  }
 onEmployeeSearch(event: any) {
  const value = event.target.value;
  this.employeeSearch = value; 
  this.employeeSuggestions = this.allUsers.filter((u) =>
    u.employeeId.toString().includes(value)
  );
}


  searchEmployee() {
    const query = this.employeeSearch.trim().toLowerCase();

    if (!query) {
      this.employeeSuggestions = [];
      return;
    }

    this.employeeSuggestions = this.allUsers.filter((user) =>
      user.employeeId.toString().toLowerCase().includes(query)
    );
  }

  selectEmployee(user: any) {
    this.selectedEmployee = user;
    this.employeeSearch = user.employeeId.toString();
    this.employeeSuggestions = [];
    this.leaveForm.patchValue({ employeeId: user.employeeId });
  }
validateEmployeeId() {
  const typedId = this.leaveForm.get('employeeId')?.value;

  this.employeeSearch = typedId; 

  if (!typedId) {
    this.isEmployeeValid = false;
    this.selectedEmployee = null;
    this.updateAdminFieldAccess(); 
    return;
  }

  const found = this.allUsers.find(
    (u) => String(u.employeeId) === String(typedId)
  );

  if (found) {
    this.isEmployeeValid = true;
    this.selectedEmployee = found;
  } else {
    this.isEmployeeValid = false;
    this.selectedEmployee = null;
  }

  this.updateAdminFieldAccess(); 
}

updateAdminFieldAccess() {
  if (!this.isAdmin) return;

  if (this.isEmployeeValid) {
    this.leaveForm.get("leaveType")?.enable();
    this.leaveForm.get("startDate")?.enable();
    this.leaveForm.get("endDate")?.enable();
    this.leaveForm.get("reason")?.enable();
  } else {
    this.leaveForm.get("leaveType")?.disable();
    this.leaveForm.get("startDate")?.disable();
    this.leaveForm.get("endDate")?.disable();
    this.leaveForm.get("reason")?.disable();
  }
}



}
