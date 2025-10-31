import {Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { LeaveService,newLeaveRequest } from 'src/app/services/leave.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  carryOver: number;
}

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  isAdmin = false;
  isUser = false;
  employeeId = '';
  showApplyLeaveModal = false;
  showCompOffModal = false;
  activeTab: 'leave' | 'compoff' = 'leave';

  leaveForm!: FormGroup;
  // compOffForm!: FormGroup;

  leaveList: newLeaveRequest[] = [];
  filteredRequests: newLeaveRequest[] = [];
  // compOffList: AddCompoffLeave[] = [];

  sortColumn: keyof newLeaveRequest | '' = '';
  sortKey:string ='';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  itemsPerPage = 5;
  // compOffFiltered: AddCompoffLeave[] = [];
  // filteredCompOffRequests: AddCompoffLeave[] = [];
  // compOffSortColumn: keyof AddCompoffLeave | 'employeeId' | '' = '';
  // compOffSortDirection: 'asc' | 'desc' = 'asc';
  // compOffSearchTerm = '';
  // compOffStatusFilter = '';
  // compOffCurrentPage = 1;
  // compOffItemsPerPage = 5;




  leaveBalances: LeaveBalance[] = [
    { leaveType: 'Casual Leave', total: 12, used: 0, carryOver: 0 },
    { leaveType: 'Sick Leave', total: 10, used: 0, carryOver: 0 },

  ];

  leaveCards: any[] = [];
  selectedDate = '';
  // filteredCompOffList: any;

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private authService: AuthService,
    // private compoffService: AddCompoffLeaveService,
    private snackBar: MatSnackBar
  ) {}
  private lastUpdatedMonth = new Date().getMonth();

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.logout();
      return;
    }

    this.employeeId = this.authService.getEmployeeId() || '';
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();

   
    this.initForms();
    this.loadLeaves();
    this.checkYearEndReset();
     setInterval(() => {
    const currentMonth = new Date().getMonth();
    if (currentMonth !== this.lastUpdatedMonth) {
      this.lastUpdatedMonth = currentMonth;
      this.calculateLeaveBalances();
    }
  }, 86400000); // check daily
    this.updateLeaveCards();
  }

  /** Initialize Forms */
  private initForms(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      employeeId: [{ value: this.employeeId, disabled: !this.isAdmin, }],
      startDate: [null, Validators.required],
      endDate: [null, [Validators.required, this.endDateAfterStartDateValidator.bind(this)]],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.leaveForm.get('startDate')?.valueChanges.subscribe(() => {
      this.leaveForm.get('endDate')?.updateValueAndValidity();
    });

    // this.compOffForm = this.fb.group({
    //   employeeId: [{ value: this.employeeId, disabled: !this.isAdmin }, [Validators.required, Validators.minLength(4)]],
    //   startDate: [null, Validators.required],
    //   reason: ['', [Validators.required, Validators.minLength(5)]]
    // });
  }

  /** Leave Requests */
  loadLeaves(): void {
    const obs = this.isAdmin ? this.leaveService.getAllLeaveRequests() : this.leaveService.getMyLeaveRequests();
    obs.subscribe({
      next: res => this.processLeaveResponse(res),
      error: err => console.error('Error fetching leave requests:', err)
    });
  }

 private processLeaveResponse(res: any): void {
  const data: any[] = res?.body ?? [];

  this.leaveList = data.map(l => {
    const totalDays = l.totalDays ?? this.calculateDays(l.startDate, l.endDate);

    return {
      id: l.id,
      leaveType: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      reason: l.reason,
      status: this.formatStatus(l.status),
      duration: `${totalDays} days`,
      totalDays,
      // prefer full user object from backend; fall back to employeeId if backend returned flat employeeId
      user: l.user ?? (l.employeeId ? { employeeId: l.employeeId } : undefined)
    } as newLeaveRequest;
  });

  this.applyFilters();
  this.calculateLeaveBalances();
  this.updateLeaveCards();
}

  /** Apply Leave */
 onSubmit(): void {
  this.leaveForm.markAllAsTouched();

  if (!this.leaveForm.valid) {
    this.snackBar.open('Please fill all required fields', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
    return;
  }

  const formValue = this.leaveForm.getRawValue();
  const leaveType = formValue.leaveType;

  //  Employee ID handling
  let selectedEmployeeId: number;
  if (this.isAdmin) {
    selectedEmployeeId = Number(formValue.employeeId);
    if (!selectedEmployeeId) {
      this.snackBar.open('Please enter a valid Employee ID', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      return;
    }
  } else {
    selectedEmployeeId = Number(this.employeeId);
  }

  const startDate: Date = formValue.startDate;
  const endDate: Date = formValue.endDate;

  //  Format dates
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  const totalDays = this.calculateDays(startDate, endDate);
  const leaveBalance = this.leaveBalances.find(lb => lb.leaveType === leaveType);
if (leaveBalance) {
  const available = leaveBalance.total - leaveBalance.used + leaveBalance.carryOver;
  if (available < totalDays) {
    this.snackBar.open(
      `You only have ${available} ${leaveType} days available, cannot apply for ${totalDays} days.`,
      'Close',
      {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      }
    );
    return;
  }
}

  //   Check for duplicate leave type or overlapping leave
  const hasConflict = this.leaveList.some(l => {
  if (l.user?.employeeId !== selectedEmployeeId) return false;

  const existingStart = new Date(l.startDate);
  const existingEnd = new Date(l.endDate);

  const sameType = l.leaveType === leaveType;

  // Check if both leaves are in the same month and year
  const sameMonth =
    existingStart.getMonth() === startDate.getMonth() &&
    existingStart.getFullYear() === startDate.getFullYear();

  const isRejected = l.status?.toLowerCase() === 'rejected';

  //  Conflict only if same type + same month + not rejected
  return sameType && sameMonth && !isRejected;
});

  if (hasConflict) {
    this.snackBar.open(
      `You already have  applied  ${leaveType} for this month.`,
      'Close',
      {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
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
    status: 'Pending',
    totalDays,
    duration: `${totalDays} days`,
    user: { employeeId: selectedEmployeeId },
  };


  this.leaveService.createLeaveRequest(newLeave).subscribe({
    next: savedLeave => {
      this.loadLeaves();
      this.snackBar.open('Leave applied successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      });
      this.closeApplyLeaveModal();
      this.resetApplyLeaveForm();
      this.calculateLeaveBalances();
    },
    error: err => {
      console.error('Error applying leave:', err);
      this.snackBar.open('Error applying leave. Try again!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
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

  this.leaveService.updateLeaveStatus(id, 'APPROVED').subscribe({
    next: () => {
      const request = this.leaveList.find(l => l.id === id);
      if (!request) return;

      request.status = 'Approved';

      const balance = this.leaveBalances.find(lb => lb.leaveType === request.leaveType);
      if (balance) balance.used += request.totalDays ?? 0;
      this.calculateLeaveBalances();
      this.updateLeaveCards();
      this.applyFilters();
    },
    error: err => console.error('Error approving leave:', err)
  });
}


rejectRequest(id?: number): void {
  if (!id) return;

  this.leaveService.updateLeaveStatus(id, 'REJECTED').subscribe({
    next: () => {
      const request = this.leaveList.find(l => l.id === id);
      if (request) request.status = 'Rejected';

      // DO NOT update leave balance since it's rejected
      this.calculateLeaveBalances();
      this.applyFilters();
    },
    error: err => console.error('Error rejecting leave:', err)
  });
}

private calculateLeaveBalances(): void {
  this.leaveBalances.forEach(lb => {
    const used = this.leaveList
      .filter(l =>
        l.leaveType === lb.leaveType &&
        l.status === 'Approved' &&
        (!this.isAdmin || l.user?.employeeId === Number(this.employeeId))
      )
      .reduce((sum, l) => sum + (l.totalDays ?? 0), 0);

    lb.used = used;
    lb.carryOver = lb.carryOver || 0;

    // Ensure available never goes negative
    const available = lb.total - used + lb.carryOver;
    if (available < 0) lb.carryOver = 0;
  });
}



resetApplyLeaveForm(): void {
  this.leaveForm.reset({
    employeeId: this.isAdmin ? '' : this.employeeId, // ✅ Admin starts blank
  });
}


  /** Date Validators */
  endDateAfterStartDateValidator(control: AbstractControl) {
    if (!this.leaveForm) return null;
    const start = this.leaveForm.get('startDate')?.value;
    const end = control.value;
    if (!start || !end) return null;
    return new Date(end) < new Date(start) ? { endBeforeStart: true } : null;
  }

  /** Utility */

  formatStatus(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'Pending';
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    return status;
  }

  /** Leave Cards */
updateLeaveCards(): void {
  this.leaveCards = this.leaveBalances.map(lb => {
    const available = lb.total - lb.used + lb.carryOver;
    return {
      title: lb.leaveType,
      total: lb.total,
      used: lb.used,
      carryOver: lb.carryOver,
      available:available < 0 ? 0 : available,
      icon: this.getLeaveIcon(lb.leaveType),
      color: this.getLeaveColor(lb.leaveType)
    };
  });
}

 /** Date filter based on leave type */
dateFilter = (date: Date | null): boolean => {
  if (!date) return false;

  const leaveType = this.leaveForm.get('leaveType')?.value;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 6); // allow up to 6 months ahead
  const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday = 0, Saturday = 6

  switch (leaveType) {
    case 'Sick Leave':
      // Can select today or yesterday only
      return date.getTime() === today.getTime() || date.getTime() === yesterday.getTime();

    case 'Casual Leave':
    case 'Earned Leave':
      // Disable weekends
      return date >= today && date <= maxDate && !isWeekend;

    case 'Leave without Pay':
      // Can select any future date
      return date >= today && date <= maxDate;

    default:
      return true;
  }
};
// Disable Sundays and dates before startDate
endDateFilter = (date: Date | null): boolean => {
  if (!date) return false;

  const leaveType = this.leaveForm.get('leaveType')?.value;
  const startDateControl = this.leaveForm?.get('startDate')?.value;
  if (!startDateControl) return false;

  const start = startDateControl instanceof Date ? startDateControl : new Date(startDateControl);

  // Disable Sundays
  if (date.getDay() === 0) return false;

  // Restrict based on leave type
  let maxDays = 0;
  switch (leaveType) {
    case 'Sick Leave':
    case 'Casual Leave':
      maxDays = 1;
      break;
    case 'Earned Leave':
      maxDays = 1;
      break;
    case 'Leave without Pay':
      maxDays = 1;
      break;
    default:
      maxDays = 10;
  }

  const maxEndDate = new Date(start);
  maxEndDate.setDate(start.getDate() + (maxDays - 1));

  // End date must be ≥ start and ≤ maxEndDate
  return date >= start && date <= maxEndDate;
};



getLeaveIcon(type: string) {
  switch(type) {
    case 'Casual Leave': return 'fas fa-calendar-day';
    case 'Sick Leave': return 'fas fa-user-injured';
    case 'Leave without Pay': return 'fas fa-calendar-times';
    default: return 'fas fa-calendar';
  }
}

getLeaveColor(type: string) {
  switch(type) {
    case 'Casual Leave': return 'bg-info';
    case 'Sick Leave': return 'bg-warning';
    case 'Leave without Pay': return 'bg-danger';
    default: return 'bg-secondary';
  }
}
private checkYearEndReset(): void {
  const currentYear = new Date().getFullYear();
  const storedYear = Number(localStorage.getItem('leaveLastResetYear'));

  if (storedYear !== currentYear) {
    // 🧾 Reset all balances
    this.leaveBalances.forEach(lb => {
      lb.total = lb.leaveType === 'Casual Leave' ? 12 : 10;
      lb.used = 0;
      lb.carryOver = 0;
    });

    this.updateLeaveCards();
    this.calculateLeaveBalances();

    localStorage.setItem('leaveLastResetYear', String(currentYear));
    console.log('✅ Leave balances reset for new year:', currentYear);
  }

  //  Check daily if it's a new year (so auto reset will happen)
  setInterval(() => {
    const now = new Date();
    if (now.getMonth() === 0 && now.getDate() === 1) {
      const lastResetYear = Number(localStorage.getItem('leaveLastResetYear'));
      if (lastResetYear !== now.getFullYear()) {
        // trigger reset again for new year
        this.leaveBalances.forEach(lb => {
          lb.total = lb.leaveType === 'Casual Leave' ? 12 : 10;
          lb.used = 0;
          lb.carryOver = 0;
        });

        this.updateLeaveCards();
        this.calculateLeaveBalances();

        localStorage.setItem('leaveLastResetYear', String(now.getFullYear()));
        console.log('🎉 Leave balances auto-reset for new year:', now.getFullYear());
      }
    }
  }, 86400000); // check once every 24 hours
}

  

// loadCompOffRequests(): void {
//   this.compoffService.getAllCompOff().subscribe({
//     next: res => {
//       if (this.isAdmin) {
//         // Admin sees all requests
//         this.compOffList = res;
//       } else {
//         // Regular user sees only their own requests
//         const empId = Number(this.authService.getEmployeeId());
//         this.compOffList = res.filter(r => r.user?.employeeId === empId);
//       }
//       this.applyCompOffFilters();
//     },
//     error: err => console.error('Error fetching Comp-Off requests:', err)
//   });
// }





//  submitCompOff(): void {
//   // Mark all fields as touched to trigger validation
//   this.compOffForm.markAllAsTouched();
//   if (!this.compOffForm.valid) return;

//   const formValue = this.compOffForm.getRawValue();

//   // Format the date manually to prevent timezone shift
//   const compOffDateObj = new Date(formValue.startDate);
//   const year = compOffDateObj.getFullYear();
//   const month = String(compOffDateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//   const day = String(compOffDateObj.getDate()).padStart(2, '0');
//   const formattedDate = `${year}-${month}-${day}`; // 'yyyy-MM-dd'

//   const payload: AddCompoffLeave = {
//     compoffDate: formattedDate,
//     reason: formValue.reason,
//     duration: '1 Day',
//     requestType: 'CompOff',
//     status: 'PENDING',
//     approvedBy: '',
//     user: {
//       employeeId: Number(this.employeeId), // currently logged-in user
//       fullName: '', // optional, can populate if you have it
//       email: '',
//       mobile: 0,
//       gender: '',
//       aadhar: '',
//       dob: '',
//       status: true,
//       roles: []
//     }
//   };

//   // Call service to create comp-off
//   this.compoffService.createCompOff(payload).subscribe({
//     next: saved => {
//       this.compOffList.unshift(saved);
//       this.closeCompOffModal();
//       this.compOffForm.reset({ employeeId: this.employeeId });
//       this.applyCompOffFilters(); // refresh filtered list
//     },
//     error: err => console.error('Error applying Comp-Off:', err)
//   });
// }



//  approveCompOff(id?: number): void {
//     if (!id) return;
//     this.compoffService.getCompOffById(id).subscribe(req => {
//       req.status = 'APPROVED';
//       this.compoffService.updateCompOff(id, req).subscribe(() => this.loadCompOffRequests());
//     });
//   }

//   rejectCompOff(id?: number): void {
//     if (!id) return;
//     this.compoffService.getCompOffById(id).subscribe(req => {
//       req.status = 'REJECTED';
//       this.compoffService.updateCompOff(id, req).subscribe(() => this.loadCompOffRequests());
//     });
//   }

//   /** Reset form */
//   resetCompOffForm(): void {
//     this.compOffForm.reset({ employeeId: this.employeeId });
//   }

//   /** ------------------- Filtering ------------------- */
//   applyCompOffFilters(): void {
//   const term = (this.compOffSearchTerm || '').toLowerCase().trim();

//   this.filteredCompOffRequests = this.compOffList.filter(r => {
//     const matchesStatus = this.compOffStatusFilter 
//       ? r.status?.toLowerCase() === this.compOffStatusFilter.toLowerCase() 
//       : true;

//     const matchesSearch = !term || [
//       r.user?.employeeId?.toString(),  // ✅ access via user
//       r.reason,
//       r.status
//     ].some(f => String(f || '').toLowerCase().includes(term));

//     return matchesStatus && matchesSearch;
//   });

//   this.compOffCurrentPage = 1;
//   if (this.compOffSortColumn) this.applyCompOffSort();
// }


//   /** ------------------- Sorting ------------------- */
//  /** ------------------- Comp-Off Sorting ------------------- */
// compOffSortBy(column: keyof AddCompoffLeave | 'employeeId'): void {
//   if (this.compOffSortColumn === column) {
//     this.compOffSortDirection = this.compOffSortDirection === 'asc' ? 'desc' : 'asc';
//   } else {
//     this.compOffSortColumn = column as keyof AddCompoffLeave; // cast safely
//     this.compOffSortDirection = 'asc';
//   }
//   this.applyCompOffSort();
// }

// private applyCompOffSort(): void {
//   const col = this.compOffSortColumn;
//   if (!col) return;
//   const dir = this.compOffSortDirection;

//   this.filteredCompOffRequests.sort((a, b) => {
//     let valA: any;
//     let valB: any;

//     // Handle special 'employeeId' nested property
//     if (col === 'employeeId') {
//       valA = a.user?.employeeId ?? '';
//       valB = b.user?.employeeId ?? '';
//     } else {
//       valA = (a as any)[col] ?? '';
//       valB = (b as any)[col] ?? '';
//     }

//     // Numeric comparison
//     const aNum = parseFloat(valA);
//     const bNum = parseFloat(valB);

//     // Date comparison
//     const aDate = new Date(valA);
//     const bDate = new Date(valB);

//     let result = 0;
//     if (!isNaN(aNum) && !isNaN(bNum)) result = aNum - bNum;
//     else if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) result = aDate.getTime() - bDate.getTime();
//     else result = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());

//     return dir === 'asc' ? result : -result;
//   });
// }

// getCompOffSortClass(column: keyof AddCompoffLeave | 'employeeId'): string {
//   if (this.compOffSortColumn !== column) return '';
//   return this.compOffSortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
// }



// /** ------------------- Comp-Off Pagination ------------------- */
// get paginatedCompOffRequests(): AddCompoffLeave[] {
//   const start = (this.compOffCurrentPage - 1) * this.compOffItemsPerPage;
//   return this.filteredCompOffRequests.slice(start, start + this.compOffItemsPerPage);
// }

// compOffChangePage(page: number): void {
//   if (page >= 1 && page <= this.compOffTotalPages) this.compOffCurrentPage = page;
// }

// get compOffTotalPages(): number {
//   return Math.max(1, Math.ceil(this.filteredCompOffRequests.length / this.compOffItemsPerPage));
// }



  /** ------------------- Modal Controls ------------------- */
  openApplyLeaveModal(): void { this.resetApplyLeaveForm(); this.showApplyLeaveModal = true; }
  closeApplyLeaveModal(): void { this.showApplyLeaveModal = false; }
  // openCompOffModal(): void { this.resetCompOffForm(); this.showCompOffModal = true; }
  // closeCompOffModal(): void { this.showCompOffModal = false; }

  /** ------------------- Filtering, Sorting, Pagination ------------------- */
  applyFilters(): void {
  const term = (this.searchTerm || '').toLowerCase().trim();
  this.filteredRequests = this.leaveList.filter(r => {
    const matchesStatus = this.statusFilter ? r.status === this.statusFilter : true;
    const matchesSearch = !term || [
      r.leaveType, r.duration, r.user?.employeeId, r.reason, r.status, r.startDate, r.endDate
    ].some(f => String(f).toLowerCase().includes(term));
    const matchesDate = !this.selectedDate || 
      (new Date(this.selectedDate) >= new Date(r.startDate) && new Date(this.selectedDate) <= new Date(r.endDate));
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Prioritize Pending status
  this.filteredRequests.sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return 0; // keep original order for others
  });

  this.currentPage = 1;
  if (this.sortColumn) this.applySort();
}

  sortBy(key: string): void {
  if (this.sortKey === key) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortKey = key;
    this.sortDirection = 'asc';
  }

  this.paginatedRequests.sort((a: any, b: any) => {
    const getValue = (obj: any, path: string) =>
      path.split('.').reduce((o, k) => (o ? o[k] : ''), obj);

    const valA = getValue(a, key);
    const valB = getValue(b, key);

    if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}


  private applySort(): void {
  if (!this.sortColumn) return;
  const col = this.sortColumn;
  const dir = this.sortDirection;

  this.filteredRequests.sort((a, b) => {
    // Pending always first
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;

    // Then apply normal sorting
    const valA = a[col] ?? '';
    const valB = b[col] ?? '';

    const aNum = parseFloat(valA as any);
    const bNum = parseFloat(valB as any);
    const aDate = new Date(valA as any);
    const bDate = new Date(valB as any);

    let result = 0;
    if (!isNaN(aNum) && !isNaN(bNum)) result = aNum - bNum;
    else if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) result = aDate.getTime() - bDate.getTime();
    else result = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());

    return dir === 'asc' ? result : -result;
  });
}

getSortClass(column: string): string {
  if (this.sortColumn !== column) return '';
  return this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
}


  get paginatedRequests(): newLeaveRequest[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRequests.length / this.itemsPerPage));
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  // Leave Type Badge
  getLeaveTypeBadgeClass(type?: string): string {
    switch (type) {
      case 'Earned Leave': return 'leave-type-badge leave-earned';
      case 'Casual Leave': return 'leave-type-badge leave-casual';
      case 'Sick Leave': return 'leave-type-badge leave-sick';
      case 'Leave without Pay': return 'leave-type-badge leave-compoff';
      default: return 'leave-type-badge';
    }
  }

  // Status Badge
  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Approved': return 'status-badge status-approved';
      case 'Rejected': return 'status-badge status-rejected';
      case 'Pending': return 'status-badge status-pending';
      default: return 'status-badge';
    }
  }

  // Filter leave cards by employee
  filterCardsByEmployee(employeeId: string | number): void {
    if (!employeeId) return;
    this.leaveCards = this.leaveBalances.map(lb => {
      const usedLeavesForUser = this.leaveList
        .filter(l => l.user?.employeeId == employeeId && l.leaveType === lb.leaveType)
        .reduce((acc, curr) => acc + (curr.totalDays ?? 0), 0);
      const available = lb.total - usedLeavesForUser + lb.carryOver;
      return {
        title: lb.leaveType,
        total: lb.total,
        used: usedLeavesForUser,
        carryOver: lb.carryOver,
        available: available < 0 ? 0 : available,
        icon: this.getLeaveIcon(lb.leaveType),
        color: this.getLeaveColor(lb.leaveType)
      };
    });
  }

  switchTab(tab: 'leave' | 'compoff'): void {
    this.activeTab = tab;
    // if (tab === 'compoff') this.loadCompOffRequests();
     this.loadLeaves();
     this.calculateLeaveBalances();
     this.updateLeaveCards();
    
  }

  formatDateRange(): string {
    const date = this.selectedDate ? new Date(this.selectedDate) : new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return `${startOfMonth.toLocaleDateString(undefined, options)} - ${endOfMonth.toLocaleDateString(undefined, options)}`;
  }
}
