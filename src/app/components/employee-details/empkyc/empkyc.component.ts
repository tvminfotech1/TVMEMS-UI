import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDataService } from 'src/app/services/employee-data.service';

@Component({
  selector: 'app-empkyc',
  templateUrl: './empkyc.component.html',
  styleUrls: ['./empkyc.component.css']
})
export class EmpkycComponent implements OnInit {
  employeeId!: number;
  kyc: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService
  ) {}

ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));
  const sharedData = this.empDataService.getEmployeeData(); // now no params needed

  if (sharedData?.kyc) {
    this.kyc = sharedData.kyc;
    this.employeeId = sharedData.id;
  } else {
    this.empService.getEmployees().subscribe({
      next: (res: any) => {
        const found = res?.body?.find((emp: any) => emp.id === id);
        if (found?.kyc) {
          this.kyc = found.kyc;
          this.employeeId = found.id;
          this.empDataService.setEmployeeData(found);
        }
      },
      error: (err) => console.error('Error fetching employees:', err)
    });
  }
}


  hasAnyKycData(): boolean {
    return Object.values(this.kyc || {}).some(val => !!val);
  }
}
