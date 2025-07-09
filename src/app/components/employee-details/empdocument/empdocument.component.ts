import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service';

@Component({
  selector: 'app-empdocument',
  templateUrl: './empdocument.component.html',
  styleUrls: ['./empdocument.component.css']
})
export class EmpdocumentComponent implements OnInit {
  employeeId: any;
  employeeDetails: any;

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

  getFileUrl(filePath: string): string {
    return `https://your-server.com/uploads/${filePath}`; // 🔁 Replace with your actual file hosting path
  }

  downloadFile(filePath: string) {
    const link = document.createElement('a');
    link.href = this.getFileUrl(filePath);
    link.download = filePath.split('/').pop() || 'document';
    link.target = '_blank';
    link.click();
  }
}
