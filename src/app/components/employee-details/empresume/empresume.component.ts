import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service';

@Component({
  selector: 'app-empresume',
  templateUrl: './empresume.component.html',
  styleUrls: ['./empresume.component.css']
})
export class EmpresumeComponent implements OnInit {
  employeeId: any;
  employeeDetails: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.employeeId = id;

    const sharedData = this.empDataService.getEmployeeData();

    if (sharedData) {
      this.employeeDetails = sharedData;
    } else {
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          this.employeeDetails = res.body.find((emp: any) => emp.id == id);
          this.empDataService.setEmployeeData(this.employeeDetails);
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }
}
