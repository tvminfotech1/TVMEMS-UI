import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { Router } from '@angular/router';
import { EmployeeDataService } from 'src/app/services/employee-data.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public employees: any[] = [];
  public filteredEmployees: any[] = [];
  public selectedEmployee: any = null;
  public searchText: string = '';

  constructor(
  private empService: EmployeeService,
  private router: Router,
  private empDataService: EmployeeDataService
) {}

  // ngOnInit(): void {
  //   this.empService.getEmployees().subscribe({
  //     next: (res) => {
  //       this.employees = res.map((data, index) => ({
  //         index: index + 1,
  //         name: data.fname + ' ' + data.lname,
  //         email: data.email,
  //         contact: data.current_contact,
  //         gender: data.gender,
  //         details: data
  //       }));
  //       this.filteredEmployees = [...this.employees];
  //     },
  //     error: (err) => {
  //       console.error("Error fetching employees", err);
  //     }
  //   });
  // }
  ngOnInit(): void {
    // alert("sss")
    // debugger
    this.empService.getEmployees().subscribe({
      next: (d:any) => {
       let a= d.body[0]
        console.log("Response:", a);
        
        this.employees = d.body.map((data: any) => ({
          index:"TVM-"+data.id,
          name: data.fname + ' ' + data.lname,
          email: data.email,
          contact: data.permanentContact,
          city: data.permanentCity,
          details: data
        }));
        
  
        this.filteredEmployees = [...this.employees];
      },
      error: (err) => {
        console.error("Error fetching employees", err);
      }
    });
  }
  
  onSearch() {
    const term = this.searchText.trim().toLowerCase();
  
    this.filteredEmployees = this.employees.filter(emp =>
      emp.name?.toLowerCase().includes(term) ||
      emp.details.permanentCity?.toLowerCase().includes(term) ||
      emp.contact?.toString().toLowerCase().includes(term)||
      emp.index?.toLowerCase().includes(term)
    );
  }
  
  

  viewDetails(employee: any) {
    this.selectedEmployee = employee;
    this.empDataService.setEmployeeData(employee.details); // Set the full object
  // this.router.navigate(['/admin/empresume', employee.details.id]); // Navigate with ID (optional)
  }
}
