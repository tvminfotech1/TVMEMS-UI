import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { PayrollEmployeeService } from "src/app/core/services/payroll-employee.service";
import { SalaryHistoryService } from "src/app/core/services/salary-history.service";
import { Employee, Payruns } from "src/app/core/models/employee";
import { SalaryHistory } from "src/app/core/models/salaryHistory";
import { AlertService } from "src/app/core/services/alert.service";

@Component({
  selector: "app-payruns",
  templateUrl: "./payruns.component.html",
  styleUrls: ["./payruns.component.css"],
})
export class PayrunsComponent implements OnInit {
  employees: Employee[] = [];

  salaryHistory: SalaryHistory[] = [];
  payruns: Payruns[] = [];
  filteredData: Payruns[] = [];

  searchText: string = "";
  selectedMonth: string = new Date().toISOString().slice(0, 7);

  constructor(
    private employeeService: PayrollEmployeeService,
    private salaryService: SalaryHistoryService,
    private router: Router,
    private alertservice: AlertService,
  ) {}

  ngOnInit(): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    this.selectedMonth = currentMonth;
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      emps: this.employeeService.getPayRunData(this.selectedMonth),
      salaries: this.salaryService.getAllSalaryHistory(),
    }).subscribe(({ emps, salaries }) => {
      const activeEmployees = (emps || []).filter(
        (emp) => emp.status === "Active"
      );
      this.payruns = [...activeEmployees];
      this.filteredData = [...this.payruns];
      this.salaryHistory = salaries.body;
    });
  }

  getMonthName(): string {
    const [year, month] = this.selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }

  onMonthChange() {
    this.loadData();
  }

  isPaid(empId: number): boolean {
    return this.salaryHistory.some(
      (sal) => sal.id === empId && sal.month === this.selectedMonth
    );
  }

  onSearch(): void {
    const text = this.searchText.toLowerCase().trim();
    this.filteredData = this.payruns.filter(
      (emp) =>
        emp.employeeId.toString().includes(text) ||
        emp.employeeName.toLowerCase().includes(text)
    );
  }

  GenerateSalary(emp: Payruns): void {
    const salaryRecord = this.isSalaryGenerated(emp);
    const month = this.selectedMonth;
    if (salaryRecord) {
      this.downloadSalarySlip(emp.employeeId, month);
    } else {
      if (emp.status === "Active") {
        this.router.navigate(["/mainlayout/payruns", emp.employeeId], {
          queryParams: { month: this.selectedMonth },
        });
      } else {
        this.alertservice.showWarning("Deactivated employee can't get salary.");
      }
    }
  }

  isSalaryGenerated(emp: Payruns): boolean {
    if (!this.salaryHistory || !this.salaryHistory.length) return false;

    return this.salaryHistory.some(
      (s) =>
        s.payRoleEmployee.id === emp.employeeId &&
        s.month === this.selectedMonth
    );
  }

downloadSalarySlip(employeeId: number, month: string): void {
  this.salaryService.downloadSalarySlip(employeeId, month).subscribe({
    next: (data: Blob) => {
      if (!data || data.size === 0) {
        this.alertservice.showError("Payslip file is empty or not generated.");
        return;
      }

      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip_${employeeId}_${month}.pdf`;
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.alertservice.showSuccess("Payslip downloaded successfully!");
    },

    error: (err) => {
      console.error("Error downloading salary slip:", err);
      this.alertservice.showError("Failed to download salary slip. Please try again later.");
    }
  });
}


  hasSalary(empId: number): boolean {
    return this.salaryHistory.some(
      (sal) =>
        sal.salaryId?.startsWith(empId.toString()) &&
        sal.month === this.selectedMonth
    );
  }

  getSalaryId(empId: number): string | null {
    const record = this.salaryHistory.find(
      (sal) =>
        sal.salaryId?.startsWith(empId.toString()) &&
        sal.month === this.selectedMonth
    );

    return record ? record.salaryId : null;
  }

deleteSalary(salaryId: string | null) {
  if (!salaryId) {
    this.alertservice.showError("Invalid salary record. Cannot delete.");
    return;
  }

  this.alertservice
    .showConfirm("Are you sure you want to delete this salary record?")
    .then((result) => {
      if (!result.isConfirmed) return; 

      this.salaryService.deleteSalaryBySalaryId(salaryId).subscribe({
        next: () => {
          this.alertservice.showSuccess("Salary deleted successfully.");
          this.loadData();
        },
        error: () => {
          this.alertservice.showError("Failed to delete salary.");
        },
      });
    });
}

}
