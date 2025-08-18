import { Component, OnInit } from '@angular/core';
import { LeaveRequest, LeaveService } from 'src/app/services/leave.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css'],
})
export class LeaveComponent implements OnInit {
  // --- UI state and data ---
  selectedDate: string = '';
  isAdmin = false;
  isUser = false;
  userId: number = 0; // Get from AuthService

  showApplyLeaveModal = false;
  showCompOffModal = false;

  newLeave = { type: '', startDate: '', endDate: '', reason: '' };
  newCompOff = { startDate: '', reason: '' };

  searchTerm = '';
  statusFilter = '';
  activeTab = 'leave';
  currentPage = 1;
  itemsPerPage = 10;

  leaveCards: any[] = [];
  allRequests: any[] = [];
  filteredRequests: any[] = [];
  leaveTypes: string[] = [];

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isUser = this.authService.isUser();
    this.userId = this.authService.getUserId();

    this.fetchRequests();
    this.fetchLeaveTypes(); // ✅ load leave types for dropdown
  }

  fetchRequests(): void {
    if (this.isAdmin) {
      // Admin - all requests
      this.leaveService.getAllLeaveRequests().subscribe((data) => {
        this.allRequests = data;
        this.filteredRequests = [...this.allRequests];
        this.updateLeaveCards();
      });
    } else if (this.isUser) {
      // User - only their own requests
      this.leaveService.getUserLeaveRequests(this.userId).subscribe((date) => {
        this.allRequests = date;
        this.filteredRequests = [...this.allRequests];
        this.updateLeaveCards();
      });
    }
  }

  fetchLeaveTypes(): void {
    this.leaveService.getLeaveTypes().subscribe((types) => {
      this.leaveTypes = types;
    });
  }

  updateLeaveCards(): void {
    const leaveTypes = [
      'Earned Leave',
      'Casual Leave',
      'Sick Leave',
      'Leave without Pay',
    ];
    this.leaveCards = leaveTypes.map((type) => {
      const typeRequests = this.allRequests.filter((r) => r.type === type);
      const available =
        15 - typeRequests.filter((r) => r.status === 'Approved').length;
      const requested = typeRequests.filter(
        (r) => r.status === 'Pending'
      ).length;
      return {
        title: type,
        available,
        requested,
        icon: 'fas fa-calendar',
        color: 'bg-primary',
      };
    });
  }

  filterRequests(): void {
    this.filteredRequests = this.allRequests.filter((request) => {
      const matchesSearch =
        !this.searchTerm ||
        request.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.duration
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus =
        !this.statusFilter || request.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
    this.currentPage = 1;
  }

  // --- CRUD Actions ---

  submitApplyLeave(): void {
    if (
      this.newLeave.type &&
      this.newLeave.startDate &&
      this.newLeave.endDate &&
      this.newLeave.reason
    ) {
      const days =
        Math.ceil(
          (new Date(this.newLeave.endDate).getTime() -
            new Date(this.newLeave.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      const newReq: LeaveRequest = {
        leaveType: this.newLeave.type, // ✅ fixed key
        startDate: this.newLeave.startDate,
        endDate: this.newLeave.endDate,
        reason: this.newLeave.reason,
        duration: `${days} Days`,
        status: 'Pending',
      };
      // Fixed: use createLeaveRequest
      this.leaveService.createLeaveRequest(newReq).subscribe(() => {
        this.fetchRequests();
        this.closeApplyLeaveModal();
      });
    }
  }

  submitCompOff(): void {
    if (this.newCompOff.startDate && this.newCompOff.reason) {
      const newReq: LeaveRequest = {
        leaveType: 'Comp-off',
        startDate: this.newCompOff.startDate,
        endDate: this.newCompOff.startDate,
        reason: this.newCompOff.reason,
        duration: '1 Day',
        status: 'Pending',
      }; // Fixed: use createLeaveRequest
      this.leaveService.createLeaveRequest(newReq).subscribe(() => {
        this.fetchRequests();
        this.closeCompOffModal();
      });
    }
  }

  approveRequest(request: any): void {
    if (!this.isAdmin) return;
    this.leaveService
      .updateLeaveRequest(request.id, { ...request, status: 'Approved' })
      .subscribe(() => this.fetchRequests());
  }

  rejectRequest(request: any): void {
    if (!this.isAdmin) return; // Only admin can reject
    this.leaveService
      .updateLeaveRequest(request.id, { ...request, status: 'Rejected' })
      .subscribe(() => this.fetchRequests());
  }

  cancelRequest(request: any): void {
    if (
      this.isAdmin ||
      (this.isUser &&
        request.status === 'Pending' &&
        request.userId === this.userId)
    ) {
      this.leaveService
        .deleteLeaveRequest(request.id)
        .subscribe(() => this.fetchRequests());
    }
  }

  // --- Modal handling ---
  openApplyLeaveModal(): void {
    this.showApplyLeaveModal = true;
  }
  closeApplyLeaveModal(): void {
    this.showApplyLeaveModal = false;
    this.newLeave = { type: '', startDate: '', endDate: '', reason: '' };
  }
  openCompOffModal(): void {
    this.showCompOffModal = true;
  }
  closeCompOffModal(): void {
    this.showCompOffModal = false;
    this.newCompOff = { startDate: '', reason: '' };
  }

  // --- Styling helpers ---
  getLeaveTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Earned Leave':
        return 'badge-primary';
      case 'Casual Leave':
        return 'badge-success';
      case 'Sick Leave':
        return 'badge-warning';
      case 'Comp-off':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'badge-success';
      case 'Pending':
        return 'badge-warning';
      case 'Rejected':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }
  get paginationEndIndex(): number {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredRequests.length
    );
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  // --- Unimplemented stubs (avoid UI errors, can later implement sorting etc) ---
  switchTab(arg0: string) {
    /* implement if needed */
  }
  getSortClass(arg0: string): string {
    return '';
  }
  sortBy(arg0: string) {
    /* implement if needed */
  }
  viewRequest(_t82: any) {
    /* implement if needed */
  }
  formatDateRange() {
    /* implement if needed */
  }
  onDateChange() {
    /* implement if needed */
  }
}
