import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { WorkFromHomeService } from 'src/app/services/work-from-home.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-workfromhome',
  templateUrl: './workfromhome.component.html',
  styleUrls: ['./workfromhome.component.css'],
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
  isProcessing: boolean = false;
  loadingStatus: { [key: number]: 'approve' | 'reject' | null } = {};

  canApplyWfh: boolean = true;

  constructor(
    private authservice: AuthService,
    private wfhService: WorkFromHomeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authservice.isAdmin();
    this.isUser = this.authservice.isUser();
    this.refreshRequests();
    this.fetchAllApprovalRequests();
    this.fetchAllWfhRequests();
  }

  getMonthName(): string {
    const monthName = new Date(
      this.year,
      this.currentMonthIndex
    ).toLocaleString('default', { month: 'long' });
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
          error: (err: any) => console.error('Failed to get employeeId:', err),
        });
      }
    } else if (this.isAdmin) {
      this.fetchAllWfhRequests();
    }
  }

  lastKnownStatuses: { [key: string]: string } = {};

  private parseDateOnly(dateStr: string | Date | undefined | null): Date | null {
    if (!dateStr) return null;
    if (dateStr instanceof Date) {
      return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (m) {
      const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
      return new Date(y, mo, d);
    }
    const dt = new Date(dateStr);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  fetchUserWfhRequests(employeeId: number) {
    this.wfhService
      .getRequestByMonthAndYear(employeeId, this.currentMonthIndex + 1, this.year)
      .subscribe({
        next: (response) => {
          let requests = response.body || [];

          for (const req of requests) {
            const fromLocal = this.parseDateOnly(req.fromDate);
            const toLocal = this.parseDateOnly(req.toDate);

            req.fromNextDay = fromLocal;
            req.toNextDay = toLocal;

            if (fromLocal && toLocal) {
              const diffTime = toLocal.getTime() - fromLocal.getTime();
              req.days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            } else {
              req.days = 0;
            }
          }


          requests = requests.sort(
            (a: any, b: any) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          );
          this.details = requests.slice(0, 10);
          const currentMonthStart = new Date(this.year, this.currentMonthIndex, 1);
          const currentMonthEnd = new Date(this.year, this.currentMonthIndex + 1, 0);
          this.approvalDetails = requests.filter((req: any) => {
            const from = this.parseDateOnly(req.fromDate);
            return from && from >= currentMonthStart && from <= currentMonthEnd;
          });
        },
        error: (err) => {
          console.error('Error fetching WFH requests for user:', err);
          this.details = [];
        },
      });
  }

  fetchAllApprovalRequests() {
    this.wfhService.getWfhAllApprovalRequests().subscribe({
      next: (response) => {
        this.approvalDetails = response?.body || response || [];

        for (const req of this.approvalDetails) {
          const from = new Date(req.fromDate);
          const to = new Date(req.toDate);

          const fromNextDay = new Date(from);
          fromNextDay.setDate(from.getDate() + 1);
          req.fromNextDay = fromNextDay;

          const toNextDay = new Date(to);
          toNextDay.setDate(to.getDate() + 1);
          req.toNextDay = toNextDay;

          const diffTime = to.getTime() - from.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive count
          req.days = diffDays;
        }

        if (this.isAdmin) {
          this.approvalDetails = this.approvalDetails.filter(
            (r: any) => r.status === 'pending'
          );
        }
        if (this.isUser) {
          this.approvalDetails = this.approvalDetails
            .sort(
              (a: any, b: any) =>
                new Date(b.created).getTime() - new Date(a.created).getTime()
            )
            .slice(0, 10);
        }
      },
      error: (error) => {
        console.error('Error fetching approval requests:', error);
        this.approvalDetails = [];
      },
    });
  }

  fetchAllWfhRequests() {
    this.wfhService
      .getWfhRequestsByMonthAndYear(this.currentMonthIndex + 1, this.year)
      .subscribe({
        next: (response) => {
          const allRequests = response.body || [];
          for (const req of allRequests) {
            const from = new Date(req.fromDate);
            const to = new Date(req.toDate);

            const fromNextDay = new Date(from);
            fromNextDay.setDate(from.getDate() + 1);
            req.fromNextDay = fromNextDay;

            const toNextDay = new Date(to);
            toNextDay.setDate(to.getDate() + 1);
            req.toNextDay = toNextDay;

            const diffTime = to.getTime() - from.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive count
            req.days = diffDays;
          }

          this.details = allRequests.filter((r: any) => r.status === 'pending');

          this.approvedRequests = allRequests
            .filter(
              (r: any) =>
                r.status === 'approved' && this.isInCurrentMonthView(r)
            )
            .sort(
              (a: any, b: any) =>
                new Date(b.created).getTime() - new Date(a.created).getTime()
            )
            .slice(0, 10);
        },
        error: (error) => {
          console.error('Error fetching WFH requests for admin:', error);
          this.details = [];
          this.approvedRequests = [];
        },
      });
  }

  isInCurrentMonthView(request: any): boolean {
    const from = new Date(request.fromDate);
    const to = new Date(request.toDate);

    const fromLocal = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()
    );
    const toLocal = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    const startOfMonth = new Date(this.year, this.currentMonthIndex, 1);
    const endOfMonth = new Date(this.year, this.currentMonthIndex + 1, 0);

    return fromLocal <= endOfMonth && toLocal >= startOfMonth;
  }

  updateStatus(
    request: any,
    newStatus: 'approved' | 'rejected' | 'pending'
  ): void {
    if (!this.isAdmin) return;

    this.loadingStatus[request.requestId] =
      newStatus === 'approved' ? 'approve' : 'reject';

    const updatedRequest = {
      ...request,
      status: newStatus,
    };

    this.wfhService.updateWfhStatus(updatedRequest).subscribe({
      next: (response) => {
        this.details = this.details.filter(
          (d) => d.requestId !== request.requestId
        );
        this.fetchAllApprovalRequests();
        this.refreshRequests();

        this.snackBar.open(
          `WFH Request ${
            request.requestId
          } status updated to ${newStatus.toUpperCase()}`,
          'Close',
          {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          }
        );

        this.loadingStatus[request.requestId] = null;
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.snackBar.open(
          'Failed to update status. Please try again.',
          'close',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          }
        );
        this.loadingStatus[request.requestId] = null;
      },
    });
  }

  applyWfh() {
    this.showApplyForm = true;
  }

  onFormSubmitted(newRequest: any) {
    this.showApplyForm = false;

    if (newRequest) {
      this.details.unshift(newRequest);

      this.snackBar.open('WFH Request submitted successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
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
    return this.details.filter((d) => d.status === status).length;
  }

  getProgress(status: string): number {
    const count = this.getCount(status);
    return this.totalRequests > 0
      ? Math.round((count / this.totalRequests) * 100)
      : 0;
  }
}
