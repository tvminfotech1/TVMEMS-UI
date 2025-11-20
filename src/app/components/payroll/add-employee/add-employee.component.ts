import { Component, OnInit } from "@angular/core";
import { PayrollEmployeeService } from "src/app/services/payroll-employee.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Employee } from "src/app/models/employee";
import { UserService } from "./user.service";

export interface EmployeePayload {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  joiningDate: string;
  employeeType: string;
  location: string;
  status: string;
  ctc: number;
  basicSalary: number;
  inHandSalary: number;
  aadhaarNumber: string;
  panNumber: string;

  bankDetails: {
    id?: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
}

@Component({
  selector: "app-add-employee",
  templateUrl: "./add-employee.component.html",
  styleUrls: ["./add-employee.component.css"],
})
export class AddEmployeeComponent implements OnInit {
  searchId: number = 0;
  searchedEmployee: any = null;
  isEditMode: boolean = false;
  hasPayrollRecord: boolean = false;
  employee: Employee = {
    fullName: "",
    email: "",
    phone: "",
    department: "",
    joiningDate: "",
    employeeType: "",
    location: "",
    status: "Active",
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
    },
    id: 0,
  };

  constructor(
    private empService: PayrollEmployeeService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.employee.status = "Active";
    this.route.queryParams.subscribe((params) => {
      const id = params["id"];
      const mode = params["mode"];

      if (mode === "edit" && id) {
        this.isEditMode = true;
        this.loadEmployeeForEdit(+id);
      } else {
        this.isEditMode = false;
        this.employee.status = "Active";
      }
    });
  }

  searchEmployee() {
    if (!this.searchId) {
      alert("Please enter an Employee ID");
      return;
    }

    const empId = Number(this.searchId);

    this.userService.getUserById(empId).subscribe(
      (userData: any) => {
        if (!userData || Object.keys(userData).length === 0) {
          alert("Employee not found!");
          this.searchedEmployee = null;
        } else {
          this.searchedEmployee = userData;
        }
      },
      (error) => {
        alert("Employee not found!");
        this.searchedEmployee = null;
        console.error(error);
      }
    );
  }
  loadEmployeeForEdit(id: number): void {
    this.isEditMode = true;
    this.empService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.searchId = data.id;
        this.hasPayrollRecord = true;
      },
      error: (err) => {
        console.error("Error loading employee for edit:", err);
        alert("Failed to load employee details.");
      },
    });
  }

  selectEmployee() {
    if (!this.searchedEmployee) return;
    this.employee.id = this.searchedEmployee.id || this.searchId;
    this.employee.fullName = this.searchedEmployee.fullName;
    this.employee.email = this.searchedEmployee.email;
    this.employee.phone = this.searchedEmployee.mobile;
    this.employee.aadhaarNumber = this.searchedEmployee.aadhar;
    this.employee.joiningDate = this.searchedEmployee.joiningDate;
    this.employee.panNumber = this.searchedEmployee.pan;

    this.searchedEmployee = null;
  }

  onSubmit(empForm: any): void {
    if (!empForm.valid) {
      alert("Please fill out all required fields before submitting.");
      return;
    }

    if (!this.employee.id && !this.searchId) {
      alert("Please enter or select a valid Employee ID.");
      return;
    }

    this.employee.id = this.employee.id || this.searchId;

    if (this.isEditMode) {
      this.empService
        .updateEmployee(this.employee.id, this.employee)
        .subscribe({
          next: () => {
            alert("Employee Updated Successfully!");
            this.router.navigate(["/mainlayout/payroll-employee"]);
          },
          error: (err) => {
            console.error("Error updating employee:", err);
            alert("Failed to update employee.");
          },
        });
    } else {
      this.empService.addEmployee(this.employee).subscribe({
        next: () => {
          alert("Employee Added Successfully!");
          this.router.navigate(["/mainlayout/payroll-employee"]);
        },
        error: (err) => {
          console.error("Error while adding employee:", err);
          alert("Failed to add employee. Please try again.");
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(["/mainlayout/payroll-employee"]);
  }
}
