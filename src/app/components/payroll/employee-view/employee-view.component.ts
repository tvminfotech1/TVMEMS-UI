import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PayrollEmployeeService } from 'src/app/services/payroll-employee.service';
import { Employee } from 'src/app/models/employee';

@Component({
  selector: 'app-employee-view',
  templateUrl: './employee-view.component.html',
  styleUrls: ['./employee-view.component.css']
})
export class EmployeeViewComponent implements OnInit {

  employee!: Employee;

  constructor(
    private route: ActivatedRoute,
    private employeeService: PayrollEmployeeService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null; // Convert string to number using +

    if (id !== null) {
      this.employeeService.getEmployeeById(id).subscribe(emp => {
        if (emp) {
          this.employee = emp;
        }
      });
    }
  }

  toggleStatus(): void {
    const newStatus = this.employee.status === 'Active' ? 'Deactivated' : 'Active';

    this.employeeService.updateEmployeeStatus(this.employee.id, newStatus).subscribe({
      next: () => {
        this.employee.status = newStatus;
      },
      error: (err) => {
        console.error('Failed to update status', err);
        alert('Status update failed.');
      }
    });
  }
}
