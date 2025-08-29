import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { WorkFromHomeService } from 'src/app/services/work-from-home.service';

@Component({
  selector: 'app-workfromhome',
  templateUrl: './workfromhome.component.html',
  styleUrls: ['./workfromhome.component.css']
})
export class WorkfromhomeComponent implements OnInit {
  currentMonthIndex = new Date().getMonth();
  year = new Date().getFullYear();
  details: any[] = [];
  isAdmin = false;
  isUser = false;
  showApplyForm: boolean = false;

  
  constructor(
    private authservice: AuthService,
    private wfhService: WorkFromHomeService,
  ) { }

  // ngOnInit(): void {
  //   this.isAdmin = this.authservice.isAdmin();
  //   this.isUser = this.authservice.isUser();
  //   this.fetchWfhRequests();
  //   // this.loadWfhRequests();

  // }

  ngOnInit(): void {
  this.isAdmin = this.authservice.isAdmin();
  this.isUser = this.authservice.isUser();
  }

  getMonthName(): string {
    return new Date(this.year, this.currentMonthIndex).toLocaleString('default', { month: 'long' });
  }

  nextMonth() {
    if (this.currentMonthIndex < 11) {
      this.currentMonthIndex++;
      this.refreshRequests();
    }
  }

  prevMonth() {
    if (this.currentMonthIndex > 0) {
      this.currentMonthIndex--;
      this.refreshRequests();
    }
  }

  
refreshRequests() {
  if (this.isUser) {
    const email = this.authservice.getEmailFromToken();
    if (email) {
      this.authservice.getUserId(email).subscribe({
        next: (id: number) => this.fetchUserWfhRequests(id),
        error: (err: any) => console.error('Failed to get employeeId:', err)
      });
    }
  } else if (this.isAdmin) {
    this.fetchAllWfhRequests();
  }
}

  // fetchWfhRequests() {
  //   this.wfhService.getWfhRequestsByMonth().subscribe({
  //     next: (response) => {
  //       this.details = response.body || [];

  //       // Updated Static data to include 'employeeName' and 'employeeId'
  //       // const staticData = [
  //       //   {
  //       //     id: 99991,
  //       //     employeeName: 'John Doe', // Added this
  //       //     employeeId: 'EMP001',     // Added this
  //       //     fromDate: '15 Jul 25',
  //       //     toDate: '15 Jul 25',
  //       //     days: '1 Day',
  //       //     reason: 'Demo Static Entry One',
  //       //     created: '14 Jul 25',
  //       //     approver: 'HR Manager',
  //       //     // employee: 'John Doe', // This 'employee' property seems redundant if you use 'employeeName'
  //       //     status: 'approved'
  //       //   },
  //       //   {
  //       //     id: 99992,
  //       //     employeeName: 'Jane Smith', // Added this
  //       //     employeeId: 'EMP002',       // Added this
  //       //     fromDate: '18 Jul 25',
  //       //     toDate: '19 Jul 25',
  //       //     days: '2 Days',
  //       //     reason: 'Static Example Two',
  //       //     created: '16 Jul 25',
  //       //     approver: 'Team Lead',
  //       //     // employee: 'Jane Smith', // This 'employee' property seems redundant if you use 'employeeName'
  //       //     status: 'pending'
  //       //   }
  //       // ];
  //       // this.details = [...this.details, ...staticData];
  //       // console.log(this.details);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching WFH requests:', error);
  //       // Error hone par sirf static data dikhana, with emp details
  //       this.details = [
  //         // { id: 99991, employeeName: 'John Doe', employeeId: 'EMP001', fromDate: '15 Jul 25', toDate: '15 Jul 25', days: '1 Day', reason: 'Demo Static Entry One', created: '14 Jul 25', approver: 'HR Manager', status: 'approved' },
  //         // { id: 99992, employeeName: 'Jane Smith', employeeId: 'EMP002', fromDate: '18 Jul 25', toDate: '19 Jul 25', days: '2 Days', reason: 'Static Example Two', created: '16 Jul 25', approver: 'Team Lead', status: 'pending' }
  //       ];
  //     }
  //   });
  // }



fetchUserWfhRequests(employeeId: number) {
  this.wfhService.getRequestByMonthAndYear(employeeId, this.currentMonthIndex + 1, this.year).subscribe({
    next: (response) => this.details = response.body || [],
    error: (err) => {
      console.error('Error fetching WFH requests for user:', err);
      this.details = [];
    }
  });
}

fetchAllWfhRequests() {
  this.wfhService.getWfhRequestsByMonthAndYear(this.currentMonthIndex + 1, this.year).subscribe({
    next: (response) => this.details = response.body || [],
    error: (error) => {
      console.error('Error fetching WFH requests for admin:', error);
      this.details=[];
    }
  });
}

  updateStatus(request: any, newStatus: 'approved' | 'rejected' | 'pending') {
    request.status = newStatus; 
    this.wfhService.updateWfhStatus(request).subscribe({
      next: (response) => {
        console.log('Status updated successfully:', response);
        this.fetchAllWfhRequests();
      },
      error: (error) => {
        console.error('Error updating status:', error);
      }
    });
  }

  // original
  // updateStatus(request: any, newStatus: 'approved' | 'rejected' | 'pending') {
  //   request.status = newStatus;
  //   this.wfhService.updateWfhStatus(request.id, newStatus).subscribe({
  //       next: (response) => {
  //           console.log('Status updated successfully:', response);
  //           this.fetchWfhRequests();
  //       },
  //       error: (error) => {
  //           console.error('Error updating status:', error);
  //       }
  //   });
  // }

  applyWfh() {
    this.showApplyForm = true;
  }

  onFormSubmitted() {
    this.showApplyForm = false;
    this.fetchAllWfhRequests();
    alert('WFH Request submitted successfully!');
  }

  onFormCancelled() {
    this.showApplyForm = false;
  }

  get totalRequests(): number {
    return this.details.length;
  }

  getCount(status: string): number {
    return this.details.filter(d => d.status === status).length;
  }

  getProgress(status: string): number {
    const count = this.getCount(status);
    return this.totalRequests > 0 ? Math.round((count / this.totalRequests) * 100) : 0;
  }
}