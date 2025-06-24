import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  Math = Math;
  selectedDate: string = '';  
  
  // Modal visibility flags
  showApplyLeaveModal = false;
  showCompOffModal = false;
  
  // Form data
  newLeave = {
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  };
  
  newCompOff = {
    startDate: '',
    reason: ''
  };
  
  // Table data and filters
  searchTerm = '';
  statusFilter = '';
  activeTab = 'leave';
  currentPage = 1;
  itemsPerPage = 10;
  
  // Sample data
  leaveCards = [
    {
      title: 'Earned Leave',
      available: 15,
      requested: 5,
      icon: 'fas fa-calendar-check',
      color: 'bg-primary'
    },
    {
      title: 'Casual Leave',
      available: 0,
      requested: 0,
      icon: 'fas fa-calendar-day',
      color: 'bg-success'
    },
    {
      title: 'Sick Leave',
      available: 10,
      requested: 1,
      icon: 'fas fa-user-injured',
      color: 'bg-warning'
    },
    {
      title: 'Leave without Pay',
      available: '10',
      requested: 0,
      icon: 'fas fa-calendar-times',
      color: 'bg-info'
    }
  ];
  
  allRequests = [
    {
      type: 'Earned Leave',
      duration: '2 Days',
      status: 'Pending',
      startDate: '2024-06-10',
      endDate: '2024-06-11',
      reason: 'Personal work'
    },
    {
      type: 'Sick Leave',
      duration: '1 Day',
      status: 'Approved',
      startDate: '2024-05-20',
      endDate: '2024-05-20',
      reason: 'Medical appointment'
    }
  ];
  
  filteredRequests = [...this.allRequests];
  
  constructor() { }
  
  ngOnInit(): void {
    this.filterRequests();
  }
  
  // Modal Methods
  openApplyLeaveModal(): void {
    this.showApplyLeaveModal = true;
    this.resetApplyLeaveForm();
  }
  
  closeApplyLeaveModal(): void {
    this.showApplyLeaveModal = false;
    this.resetApplyLeaveForm();
  }
  
  openCompOffModal(): void {
    this.showCompOffModal = true;
    this.resetCompOffForm();
  }
  
  closeCompOffModal(): void {
    this.showCompOffModal = false;
    this.resetCompOffForm();
  }
  
  // Form Reset Methods
  resetApplyLeaveForm(): void {
    this.newLeave = {
      type: '',
      startDate: '',
      endDate: '',
      reason: ''
    };
  }
  
  resetCompOffForm(): void {
    this.newCompOff = {
      startDate: '',
      reason: ''
    };
  }
  
  // Form Submission Methods
  submitApplyLeave(): void {
    if (this.newLeave.type && this.newLeave.startDate && this.newLeave.endDate && this.newLeave.reason) {
      console.log('Submitting leave request:', this.newLeave);
      // Add your API call here
      this.closeApplyLeaveModal();
      // Optionally show success message
    }
  }
  
  submitCompOff(): void {
    if (this.newCompOff.startDate && this.newCompOff.reason) {
      console.log('Submitting comp-off request:', this.newCompOff);
      // Add your API call here
      this.closeCompOffModal();
      // Optionally show success message
    }
  }
  
  // Table Methods
  filterRequests(): void {
    this.filteredRequests = this.allRequests.filter(request => {
      const matchesSearch = !this.searchTerm || 
        request.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.duration.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || request.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    this.currentPage = 1; // Reset to first page when filtering
  }
  
  switchTab(tab: string): void {
    this.activeTab = tab;
    // You can filter data based on tab if needed
  }
  
  sortBy(column: string): void {
    // Implement sorting logic
    console.log('Sorting by:', column);
  }
  
  getSortClass(column: string): string {
    // Return sort indicator class
    return '';
  }
  
  // Action Methods
  viewRequest(request: any): void {
    console.log('Viewing request:', request);
    // Implement view logic
  }
  
  editRequest(request: any): void {
    console.log('Editing request:', request);
    // Implement edit logic
  }
  
  cancelRequest(request: any): void {
    console.log('Cancelling request:', request);
    // Implement cancel logic
  }
  
  // Utility Methods
formatDateRange(): string {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  if (this.selectedDate) {
    return new Date(this.selectedDate).toDateString();
  } else {
    return `${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`;
  }
}
onDateChange() {
  console.log('Date selected:', this.selectedDate);
  // You can do additional logic here if needed
}

  
  toggleDatePicker(): void {
    // Implement date picker toggle
    console.log('Toggling date picker');
  }
  
  getLeaveTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Earned Leave':
        return 'badge-primary';
      case 'Casual Leave':
        return 'badge-success';
      case 'Sick Leave':
        return 'badge-warning';
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
  
  // Pagination Methods
  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }
  
  get paginationEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredRequests.length);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

}

