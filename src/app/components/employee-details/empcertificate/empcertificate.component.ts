import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service';

@Component({
  selector: 'app-empcertificate',
  templateUrl: './empcertificate.component.html',
  styleUrls: ['./empcertificate.component.css']
})
export class EmpcertificateComponent implements OnInit {
  employeeId: string | null = null;
  employeeDetails: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');

    const sharedData = this.empDataService.getEmployeeData();

    if (sharedData) {
      this.employeeDetails = sharedData;
    } else if (this.employeeId) {
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          const found = res.body.find((emp: any) => emp.id == this.employeeId);
          if (found) {
            this.employeeDetails = found;
            this.empDataService.setEmployeeData(found);
          }
        },
        error: (err) => console.error('Error:', err)
      });
    }
  }
}
