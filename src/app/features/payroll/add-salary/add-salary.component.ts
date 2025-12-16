import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PayrollEmployeeService } from "src/app/core/services/payroll-employee.service";
import { SalaryHistoryService } from "src/app/core/services/salary-history.service";
import { Employee } from "src/app/core/models/employee";
import { SalaryHistory } from "src/app/core/models/salaryHistory";
import { AlertService } from "src/app/core/services/alert.service";

@Component({
  selector: "app-add-salary",
  templateUrl: "./add-salary.component.html",
  styleUrls: ["./add-salary.component.css"],
})
export class AddSalaryComponent implements OnInit {
  @ViewChild("paySlip", { static: false }) paySlipElement!: ElementRef;

  employee: Employee = {
    id: 0,
    fullName: "",
    email: "",
    phone: "",
    department: "",
    joiningDate: "",
    employeeType: "",
    location: "",
    status: "",
    ctc: 0,
    basicSalary: 0,
    inHandSalary: 0,
    aadhaarNumber: "",
    panNumber: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branch: "",
    }
  };

  payMonth: string = new Date().toISOString().substring(0, 7);
  payYear: number = new Date().getFullYear();

  basicSalary = 0;
  hra = 0;
  medicalAllowance = 0;
  conveyanceAllowance = 0;
  flexiBenefit = 0;
  leaveTravel = 0;
  specialAllowance = 0;

  pf = 0;
  esi = 0;
  professionalTax = 0;
  incomeTax = 0;
  leaveDeduction = 0;
  otherDeduction = 0;

  totalEarnings = 0;
  totalDeductions = 0;
  netPay = 0;
  ctc = 0;
  remainingCtc = 0;

  nwd: number = 31;
  nol: number = 0;

  employeeId: number = 1;

  constructor(
    private route: ActivatedRoute,
    private employeeService: PayrollEmployeeService,
    private salaryService: SalaryHistoryService,
    private alertservice: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const empIdParam = this.route.snapshot.paramMap.get("id");
    const selectedMonth = this.route.snapshot.queryParamMap.get("month");

    if (selectedMonth) {
      this.payMonth = selectedMonth;
      this.payYear = parseInt(selectedMonth.split("-")[0]);
    }

    setTimeout(() => {
      this.updateNWDFromMonth();
    });

    if (selectedMonth) {
      this.payMonth = selectedMonth;
      this.payYear = parseInt(selectedMonth.split("-")[0]);
    } else {
      this.payMonth = new Date().toISOString().substring(0, 7);
      this.payYear = new Date().getFullYear();
    }

    if (empIdParam) {
      const empId = +empIdParam;

      this.employeeService.getEmployeeById(empId).subscribe({
        next: (emp) => {
          this.employee = emp;
          this.basicSalary = emp.basicSalary;
          this.ctc = emp.ctc;
          this.calculateSalary();
        },
        error: (err) => {
          console.error("Error fetching employee:", err);
        },
      });
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const char = event.key;

    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
    }
  }

  updateNWDFromMonth(): void {
    const [year, month] = this.payMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    this.nwd = daysInMonth;
    this.calculateSalary();
  }

  calculateSalary(): void {
    this.totalEarnings =
      this.basicSalary +
      this.hra +
      this.medicalAllowance +
      this.conveyanceAllowance +
      this.flexiBenefit +
      this.leaveTravel +
      this.specialAllowance;

    this.totalDeductions =
      this.pf +
      this.esi +
      this.professionalTax +
      this.incomeTax +
      this.leaveDeduction +
      this.otherDeduction;

    this.netPay = this.totalEarnings - this.totalDeductions;
    this.remainingCtc = this.ctc - (this.totalEarnings + this.totalDeductions);
  }

  addSalary(): void {
    const monthStr: string = this.payMonth;
    const empId: number = this.employee.id;

    this.salaryService
      .getSalaryByEmployeeAndMonth(empId, monthStr)
      .subscribe((existing) => {
        if (existing && existing.length > 0) {
          this.alertservice.showSuccess(`Salary already generated for ${monthStr}.`);
          return;
        }

        const salary: SalaryHistory = {
          salaryId: `${empId}-${monthStr.replace("-", "")}`,
          id: empId,
          month: monthStr,
          year: parseInt(monthStr.split("-")[0]),
          basicSalary: this.basicSalary,
          hra: this.hra,
          medicalAllowance: this.medicalAllowance,
          conveyanceAllowance: this.conveyanceAllowance,
          flexiBenefit: this.flexiBenefit,
          leaveTravel: this.leaveTravel,
          specialAllowance: this.specialAllowance,
          pf: this.pf,
          esi: this.esi,
          professionalTax: this.professionalTax,
          incomeTax: this.incomeTax,
          leaveDeduction: this.leaveDeduction,
          otherDeduction: this.otherDeduction,
          netPay: this.netPay,
          ctc: this.ctc,
          remainingCtc: this.remainingCtc,
          nwd: this.nwd,
          nol: this.nol,
          payRoleEmployee: this.employee.id,
        };

        const jd = this.employee.joiningDate;
        const [jDay, jMonth, jYear] = jd.split("-").map(Number);

        const [sYear, sMonth] = monthStr.split("-").map(Number);

        const isBeforeJoiningMonth =
          sYear < jYear || (sYear === jYear && sMonth < jMonth);

        if (isBeforeJoiningMonth) {
          this.alertservice.showError("Cannot add salary before joining date.");
          return;
        }

        this.salaryService.addSalaryHistory(salary).subscribe({
          next: () => {
            this.alertservice.showSuccess("Salary added successfully.");
            this.router.navigate(["/mainlayout/payroll-employee"]);
          },
          error: (err) => {
            const msg =
              (typeof err.error === "string" ? err.error : null) ||
              err.error?.message ||
              err.error?.error ||
              "Failed to add salary.";

            this.alertservice.showError(msg);
          },
        });
      });
  }

  backbtn() {
    this.router.navigate(["/mainlayout/payroll-employee"]);
  }

}
