import { Component, OnInit } from '@angular/core';
import { UserlistService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public employees: any[] = [];
  public filteredEmployees: any[] = [];
  public searchText: string = '';
  public isAdmin:boolean =false;



  constructor(
  private userlistService:UserlistService,
  private authService: AuthService
) {}

 ngOnInit(): void {
     this.isAdmin=this.authService.isAdmin();
     if(this.isAdmin){
      this.allUser();
     }
    }

     allUser(): void{
      this.userlistService.getAllUser().subscribe({
        next:(response) => {
          this.employees=response.body || [];
  this.filteredEmployees = [...this.employees];
          console.log(this.employees);          
        },
        error:(err)=>{
            console.error("❌ Error fetching users", err);
      this.employees = [];
      this.filteredEmployees = [];
        }
      });
     }
  

  onSearch(): void {
  const term = this.searchText.trim().toLowerCase();
  this.filteredEmployees = this.employees.filter(emp =>
    emp.employeeId?.toString().toLowerCase().includes(term) ||
    emp.fullName?.toLowerCase().includes(term) ||
    emp.mobile?.toString().toLowerCase().includes(term) ||
    emp.email?.toLowerCase().includes(term)
  );
}


  deleteEmployee(employeeId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.userlistService.deleteUser(employeeId).subscribe({
      next: (res) => {
        console.log('🗑 User deleted successfully:', res);
        alert('User deleted successfully!');
        this.filteredEmployees = this.filteredEmployees.filter(emp => emp.employeeId !== employeeId);
        this.employees = this.employees.filter(emp => emp.employeeId !== employeeId);
      },
      error: (err) => {
        console.error('❌ Error deleting user:', err);
        alert('Failed to delete user');
      }
    });
  }
 }