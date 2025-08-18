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
  employeeDetails: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const sharedData = this.empDataService.getEmployeeData();

    if (sharedData && sharedData.id === id) {
      this.employeeDetails = sharedData;
    } else {
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          this.employeeDetails = res;
          this.empDataService.setEmployeeData(res);
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }

  getFileUrl(filePath: string): string {
    return `http://localhost:8080/uploads/${filePath}`;
  }

  downloadFile(fileNameOrId: string | number) {
    if (typeof fileNameOrId === 'number') {
      this.empService.downloadDocument(fileNameOrId).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document'; 
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } else {
      const link = document.createElement('a');
      link.href = this.getFileUrl(fileNameOrId);
      link.download = fileNameOrId.split('/').pop() || 'document';
      link.target = '_blank';
      link.click();
    }
  }
}
