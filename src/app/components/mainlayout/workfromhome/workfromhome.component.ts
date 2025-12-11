import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { WorkFromHomeService } from "src/app/services/work-from-home.service";
import { AlertService } from "src/app/alert-service.service";

@Component({
  selector: "app-workfromhome",
  templateUrl: "./workfromhome.component.html",
  styleUrls: ["./workfromhome.component.css"],
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
  loadingStatus: { [key: number]: "approve" | "reject" | null } = {};
  canApplyWfh: boolean = true;

  constructor(
    private authservice: AuthService,
    private wfhService: WorkFromHomeService,
    private alertservice: AlertService,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authservice.isAdmin();
    this.isUser = this.authservice.isUser();
    this.refreshRequests();
    if (this.isAdmin) {
      this.fetchAllApprovalRequests();
    }
  }

  getMonthName(): string {
    const monthName = new Date(
      this.year,
      this.currentMonthIndex
    ).toLocaleString("default", { month: "long" });
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
  const email = this.authservice.getEmailFromToken();

  if (this.isUser && email) {
    this.authservice.getUserId(email).subscribe({
      next: (id: number) => this.fetchUserWfhRequests(id),
      error: (err: any) => console.error("Failed to get employeeId:", err),
    });
  }

  if (this.isAdmin) {
    this.fetchAllWfhRequests();
  }
}

  lastKnownStatuses: { [key: string]: string } = {};

  private parseDateOnly(
    dateStr: string | Date | undefined | null
  ): Date | null {
    if (!dateStr) return null;
    if (dateStr instanceof Date) {
      return new Date(
        dateStr.getFullYear(),
        dateStr.getMonth(),
        dateStr.getDate()
      );
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (m) {
      const y = Number(m[1]),
        mo = Number(m[2]) - 1,
        d = Number(m[3]);
      return new Date(y, mo, d);
    }
    const dt = new Date(dateStr);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  private calculateWorkingDaysExcludingSundays(
    fromDate: Date,
    toDate: Date
  ): number {
    if (!fromDate || !toDate) return 0;
    let count = 0;
    const current = new Date(fromDate);
    while (current <= toDate) {
      if (current.getDay() !== 0) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  fetchUserWfhRequests(employeeId: number) {
    this.wfhService
      .getRequestByMonthAndYear(
        employeeId,
        this.currentMonthIndex + 1,
        this.year
      )
      .subscribe({
        next: (response) => {
          let requests = response.body || [];
          for (const req of requests) {
            const fromLocal = this.parseDateOnly(req.fromDate);
            const toLocal = this.parseDateOnly(req.toDate);
            req.fromNextDay = fromLocal;
            req.toNextDay = toLocal;
            if (fromLocal && toLocal) {
              req.days = this.calculateWorkingDaysExcludingSundays(
                fromLocal,
                toLocal
              );
            } else {
              req.days = 0;
            }
          }
          requests = requests.sort(
            (a: any, b: any) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          );
          this.details = requests.slice(0, 10);
          const currentMonthStart = new Date(
            this.year,
            this.currentMonthIndex,
            1
          );
          const currentMonthEnd = new Date(
            this.year,
            this.currentMonthIndex + 1,
            0
          );
          this.approvalDetails = requests.filter((req: any) => {
            const from = this.parseDateOnly(req.fromDate);
            return from && from >= currentMonthStart && from <= currentMonthEnd;
          });
        },
        error: (err) => {
          console.error("Error fetching WFH requests for user:", err);
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
          req.fromNextDay = from;
          req.toNextDay = to;
          req.days = this.calculateWorkingDaysExcludingSundays(from, to);
        }

        if (this.isAdmin) {
          this.approvalDetails = this.approvalDetails.filter(
            (r: any) => r.status === "pending"
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
        console.error("Error fetching approval requests:", error);
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
            req.fromNextDay = from;
            req.toNextDay = to;
            req.days = this.calculateWorkingDaysExcludingSundays(from, to);
          }
          this.details = allRequests.filter((r: any) => r.status === "pending");

          this.approvedRequests = allRequests
            .filter(
              (r: any) =>
                r.status === "approved" && this.isInCurrentMonthView(r)
            )
            .sort(
              (a: any, b: any) =>
                new Date(b.created).getTime() - new Date(a.created).getTime()
            )
            .slice(0, 10);
        },
        error: (error) => {
          console.error("Error fetching WFH requests for admin:", error);
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
    newStatus: "approved" | "rejected" | "pending"
  ): void {
    if (!this.isAdmin) return;
    this.loadingStatus[request.requestId] =
      newStatus === "approved" ? "approve" : "reject";
    const updatedRequest = {
      ...request,
      status: newStatus,
    };

    this.wfhService.updateWfhStatus(updatedRequest).subscribe({
      next: () => {
        this.details = this.details.filter(
          (d) => d.requestId !== request.requestId
        );
        this.fetchAllApprovalRequests();
        this.refreshRequests();
        if(newStatus === "approved"){this.alertservice.showSuccess(
          `WFH Request ${
            request.requestId
          } status updated to ${newStatus.toUpperCase()}`
        )}
        else if(newStatus === "rejected"){this.alertservice.showalert(
          `WFH Request ${
            request.requestId
          } status updated to ${newStatus.toUpperCase()}`
        )}
      

        this.loadingStatus[request.requestId] = null;
      },
      error: (error) => {
        console.error("Error updating status:", error);
        this.alertservice.showError(
          "Failed to update status. Please try again."
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

      this.alertservice.showSuccess("WFH Request submitted successfully!");
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
