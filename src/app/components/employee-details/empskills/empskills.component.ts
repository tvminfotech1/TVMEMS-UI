import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service'; // Import shared service

@Component({
  selector: 'app-empskills',
  templateUrl: './empskills.component.html',
  styleUrls: ['./empskills.component.css']
})
export class EmpskillsComponent implements OnInit {
  employeeId: any;
  employeeDetails: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService // Inject shared service
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Check if employee details are available in shared service
    const sharedData = this.empDataService.getEmployeeData();
    
    if (sharedData) {
      this.employeeDetails = sharedData; // Use shared data if available
    } else {
      // If no shared data, fetch from API
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          this.employeeDetails = res.body.find((emp: any) => emp.id == id);
          this.empDataService.setEmployeeData(this.employeeDetails); // Save in shared service for future use
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }
}
