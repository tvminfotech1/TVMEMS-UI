import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollEmployeeService } from 'src/app/core/services/payroll-employee.service';
import { Employee } from 'src/app/core/models/employee';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-employee-view',
  templateUrl: './employee-view.component.html',
  styleUrls: ['./employee-view.component.css'],
})
export class EmployeeViewComponent implements OnInit {
  employee!: Employee;

  constructor(
    private route: ActivatedRoute,
    private employeeService: PayrollEmployeeService,
    private router: Router,
    private alertservice: AlertService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (id !== null) {
      this.employeeService.getEmployeeById(id).subscribe((emp) => {
        if (emp) {
          this.employee = emp;
        }
      });
    }
  }

  toggleStatus(): void {
    const newStatus =
      this.employee.status === 'Active' ? 'Deactivated' : 'Active';

    this.employeeService
      .updateEmployeeStatus(this.employee.id, newStatus)
      .subscribe({
        next: () => {
          this.employee.status = newStatus;
        },
        error: (err) => {
          console.error('Failed to update status', err);
          this.alertservice.showError('Status update failed.');
        },
      });
  }
  goBack() {
    this.router.navigate(['/mainlayout/payroll-employee']);
  }

  editEmployee(): void {
    this.router.navigate(['/mainlayout/add-employee'], {
      queryParams: { id: this.employee.id, mode: 'edit' },
    });
  }

  deleteEmployee(): void {
    this.alertservice.showConfirm('Are you sure you want to delete this employee?').then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(this.employee.id).subscribe({
          next: () => {
            this.alertservice.showSuccess('Employee deleted successfully!');
            this.router.navigate(['/mainlayout/payroll-employee']);
          },
          error: (err) => {
            console.error('Failed to delete employee:', err);
            this.alertservice.showError('Failed to delete employee.');
          },
        });
      }
    });
  }
}
