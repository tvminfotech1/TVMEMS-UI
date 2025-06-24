import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EmployeeService } from "../../services/employee.service";

@Component({
  selector: "app-employee-data",
  templateUrl: "./employee-data.component.html",
  styleUrls: ["./employee-data.component.css"],
})
export class EmployeeDataComponent implements OnInit {
  employeeId: any;
  employeeDetails: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    this.empService.getEmployees().subscribe({
      next: (res: any) => {
        this.employeeDetails = res.body.find((emp: any) => emp.id == id);
      },
      error: (err) => console.error("Error:", err),
    });
  }
}
