import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service'; // ✅ shared service import

@Component({
  selector: 'app-emppassport',
  templateUrl: './emppassport.component.html',
  styleUrls: ['./emppassport.component.css']
})
export class EmppassportComponent implements OnInit {
  employeeId: any;
  employeeDetails: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService // ✅ inject shared service
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const sharedData = this.empDataService.getEmployeeData();

    if (sharedData) {
      this.employeeDetails = sharedData; // ✅ use shared data
    } else {
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          this.employeeDetails = res.body.find((emp: any) => emp.id == id);
          this.empDataService.setEmployeeData(this.employeeDetails); // ✅ set shared data
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }
}
