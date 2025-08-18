import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service';

@Component({
  selector: 'app-empfamily',
  templateUrl: './empfamily.component.html',
  styleUrls: ['./empfamily.component.css']
})
export class EmpfamilyComponent implements OnInit {

  employeeId: any;
  employeeDetails: any;
  familyDetails: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const sharedData = this.empDataService.getEmployeeData();

    if (sharedData) {
      this.employeeDetails = sharedData;
      this.familyDetails = sharedData.family; 
    } else {
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          const found = res.body.find((emp: any) => emp.id == id);
          if (found) {
            this.employeeDetails = found;
            this.familyDetails = found.family; 
            this.empDataService.setEmployeeData(found);
          }
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }
}
