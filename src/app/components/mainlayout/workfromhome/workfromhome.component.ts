import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { WorkFromHomeService } from 'src/app/services/work-from-home.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  approvedRequests: any[] = [];
  approvalDetails: any[] = [];

  canApplyWfh: boolean = true;

  constructor(
    private authservice: AuthService,
    private wfhService: WorkFromHomeService,
    private snackBar: MatSnackBar,
  ) { }


  ngOnInit(): void {
    this.isAdmin = this.authservice.isAdmin();
    this.isUser = this.authservice.isUser();
    this.refreshRequests();
    this.fetchAllApprovalRequests();
    this.fetchAllWfhRequests();
    console.log(this.approvalDetails)
  }

  getMonthName(): string {
  const monthName = new Date(this.year, this.currentMonthIndex)
    .toLocaleString('default', { month: 'long' });
  return monthName.substring(0, 3); 
}


  nextMonth() {
    if (this.currentMonthIndex < 11) {
      this.currentMonthIndex++;
    } else {
      this.currentMonthIndex = 0;
      this.year++;
    }
    this.refreshRequests();
  }

  prevMonth() {
    if (this.currentMonthIndex > 0) {
      this.currentMonthIndex--;
    } else {
      this.currentMonthIndex = 11;
      this.year--;
    }
    this.refreshRequests();
  }

  refreshRequests() {
    if (this.isUser) {
      const email = this.authservice.getEmailFromToken();
      if (email) {
        this.authservice.getUserId(email).subscribe({
          next: (id: number) => {
            this.fetchUserWfhRequests(id);
          },
          error: (err: any) => console.error('Failed to get employeeId:', err)
        });
      }
    } else if (this.isAdmin) {
      this.fetchAllWfhRequests();
    }
  }

  lastKnownStatuses: { [key: string]: string } = {};

  fetchUserWfhRequests(employeeId: number) {
    this.wfhService.getRequestByMonthAndYear(employeeId, this.currentMonthIndex + 1, this.year).subscribe({
      next: (response) => {
        let requests = response.body || [];

        for (const req of requests) {
          const from = new Date(req.fromDate);
          const to = new Date(req.toDate);
          const diffTime = to.getTime() - from.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive count
          req.days = diffDays;
        }

        requests = requests.sort(
          (a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        this.details = requests.slice(0, 10);
        this.approvalDetails = requests.filter((req: any) => {
          const fromDate = new Date(req.fromDate);
          const toDate = new Date(req.toDate);

          return (
            (fromDate.getMonth() === this.currentMonthIndex && fromDate.getFullYear() === this.year) ||
            (toDate.getMonth() === this.currentMonthIndex && toDate.getFullYear() === this.year)
          );
        });

        let updatedStatusMessage = '';

        for (const req of this.details) {
          const previousStatus = this.lastKnownStatuses[req.requestId];

          if (previousStatus && previousStatus !== req.status && req.status !== 'pending') {
            updatedStatusMessage = `Your WFH request (${req.requestId}) has been ${req.status.toUpperCase()}`;
            break;
          }

          // Update current status in memory
          this.lastKnownStatuses[req.requestId] = req.status;
        }

        //  Show popup if status changed
        if (updatedStatusMessage) {
          this.snackBar.open(updatedStatusMessage, 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (err) => {
        console.error('Error fetching WFH requests for user:', err);
        this.details = [];
      }
    });
  }

  fetchAllApprovalRequests() {
    this.wfhService.getWfhAllApprovalRequests()
      .subscribe({
        next: (response) => {
          this.approvalDetails = response?.body || response || [];
        
          for (const req of this.approvalDetails) {
          const from = new Date(req.fromDate);
          const to = new Date(req.toDate);
          const diffTime = to.getTime() - from.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive count
          req.days = diffDays;
        }

          if (this.isAdmin) {
            this.approvalDetails = this.approvalDetails.filter((r: any) => r.status === 'pending');
          }
          if (this.isUser) {
            this.approvalDetails = this.approvalDetails
              .sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime())
              .slice(0, 10);
          }

          console.log('Approval Details:', this.approvalDetails);
        },
        error: (error) => {
          console.error('Error fetching approval requests:', error);
          this.approvalDetails = [];
        }
      });
  }


  fetchAllWfhRequests() {
    this.wfhService.getWfhRequestsByMonthAndYear(this.currentMonthIndex + 1, this.year)
      .subscribe({
        next: (response) => {
          const allRequests = response.body || [];
          for (const req of allRequests) {
            const from = new Date(req.fromDate);
            const to = new Date(req.toDate);
            const diffTime = to.getTime() - from.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive count
            req.days = diffDays;
          }

          this.details = allRequests.filter((r: any) => r.status === 'pending');

          this.approvedRequests = allRequests.filter((r: any) =>
            r.status === 'approved' && this.isInCurrentMonthView(r))
            .sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime())
            .slice(0, 10);
          console.log('Sorted approved requests:', this.approvedRequests.length);

        },
        error: (error) => {
          console.error('Error fetching WFH requests for admin:', error);
          this.details = [];
          this.approvedRequests = [];
        }
      });
  }

  isInCurrentMonthView(request: any): boolean {
    const from = new Date(request.fromDate);
    const to = new Date(request.toDate);

    const startOfMonth = new Date(this.year, this.currentMonthIndex, 1);
    const endOfMonth = new Date(this.year, this.currentMonthIndex + 1, 0);

    return from <= endOfMonth && to >= startOfMonth;
  }


  updateStatus(request: any, newStatus: 'approved' | 'rejected' | 'pending'): void {
    if (!this.isAdmin) return;

    const updatedRequest = {
      ...request,
      status: newStatus,
    };

    this.wfhService.updateWfhStatus(updatedRequest).subscribe({
      next: (response) => {
        console.log('Status updated successfully:', response);

        this.details = this.details.filter(d => d.requestId !== request.requestId);
        this.fetchAllApprovalRequests();
        this.refreshRequests();

        this.snackBar.open(`WFH Request ${request.requestId} status updated to ${newStatus.toUpperCase()}`, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
        );
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.snackBar.open('Failed to update status. Please try again.', 'close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyWfh() {
    
    this.showApplyForm = true;
  }

  onFormSubmitted(newRequest: any) {
    this.showApplyForm = false;

    if (newRequest) {
      // Add the new request to the top of the list
      this.details.unshift(newRequest);

      this.snackBar.open('WFH Request submitted successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      this.refreshRequests();
    }
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