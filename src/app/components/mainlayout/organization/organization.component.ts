import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  photo: string;
  managerId?: number;
  team?: string;
}

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent {
   activeTab: string = 'business';
  searchTerm: string = '';
  sortBy: string = 'name';
  selectedEmployee: Employee | null = null;
  filteredEmployees: Employee[] = [];
  employees: Employee[] = [];

  loggedInUserId: number = 3113;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Employee[]>('assets/employees.json').subscribe(data => {
      this.employees = data;
      this.filteredEmployees = [...data];
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.selectedEmployee = null;
  }

  getTeamMembers(): Employee[] {
    return this.employees.filter(emp => emp.department === 'CloudSens Services');
  }

  getLoggedInUser(): Employee | undefined {
    return this.employees.find(emp => emp.id === this.loggedInUserId);
  }

  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
  }

  closeEmployeeDetail(): void {
    this.selectedEmployee = null;
  }

  filterEmployees(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(emp =>
        emp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.id.toString().includes(this.searchTerm) ||
        emp.department.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.sortEmployees();
  }

  sortEmployees(): void {
    this.filteredEmployees.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'department':
          return a.department.localeCompare(b.department);
        case 'designation':
          return a.designation.localeCompare(b.designation);
        default:
          return 0;
      }
    });
  }
}