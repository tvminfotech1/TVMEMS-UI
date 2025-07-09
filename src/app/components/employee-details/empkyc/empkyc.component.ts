// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { EmployeeService } from 'src/app/services/employee.service';
// import { EmployeeDataService } from 'src/app/services/employee-data.service';

// @Component({
//   selector: 'app-empkyc',
//   templateUrl: './empkyc.component.html',
//   styleUrls: ['./empkyc.component.css']
// })
// export class EmpkycComponent implements OnInit {
//   employeeId: any;
//   employeeDetails: any;

//   constructor(
//     private route: ActivatedRoute,
//     private empService: EmployeeService,
//     private empDataService: EmployeeDataService
//   ) {}

//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('id');
//     const sharedData = this.empDataService.getEmployeeData();

//     if (sharedData) {
//       this.employeeDetails = sharedData;
//     } else {
//       this.empService.getEmployees().subscribe({
//         next: (res: any) => {
//           const found = res.body?.find((emp: any) => emp.id == id);
//           if (found) {
//             this.employeeDetails = found;
//             this.empDataService.setEmployeeData(found);
//           }
//         },
//         error: (err: any) => console.error('Error:', err)
//       });
//     }
//   }
// }

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
  employeeId: any;
  kyc: any;

  constructor(
    private route: ActivatedRoute,
    private empService: EmployeeService,
    private empDataService: EmployeeDataService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const sharedData = this.empDataService.getEmployeeData();

    if (sharedData && sharedData.kyc) {
      this.kyc = sharedData.kyc;
      this.employeeId = sharedData.id;
    } else {
      this.empService.getEmployees().subscribe({
        next: (res: any) => {
          const found = res?.body?.find((emp: any) => emp.id == id);
          if (found && found.kyc) {
            this.kyc = found.kyc;
            this.employeeId = found.id;
            this.empDataService.setEmployeeData(found);
          }
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }
}
