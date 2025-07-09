import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service';

@Component({
  selector: 'app-emppassport',
  templateUrl: './emppassport.component.html',
  styleUrls: ['./emppassport.component.css']
})
export class EmppassportComponent implements OnInit {
  employeeId: any;
  employeeDetails: any;
  passportDetails: any;

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
      this.passportDetails = sharedData.passport; // ✅ access nested passport object
    } else {
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          const found = res.body.find((emp: any) => emp.id == id);
          if (found) {
            this.employeeDetails = found;
            this.passportDetails = found.passport; // ✅ extract passport
            this.empDataService.setEmployeeData(found);
          }
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }
}
