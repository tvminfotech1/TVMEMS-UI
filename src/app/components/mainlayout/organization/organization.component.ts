import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
export class OrganizationComponent implements OnInit {
  activeTab: string = 'business';
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployee: Employee | null = null;

  searchTerm: string = '';
  sortBy: string = 'name';
  isLoading: boolean = false;

  teamDepartment: string = 'CloudSens Services';
  departmentHead: string = 'Suresh Vadivel';
  loggedInUserId: number = 3113;

  // New Employee form model
  newEmployee: Partial<Employee> = {
    name: '',
    email: '',
    department: '',
    designation: '',
    location: '',
    photo: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.isLoading = true;
    this.http.get<Employee[]>('/assets/employees.json') // Replace with your API
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.filteredEmployees = [...data];
          this.sortEmployees();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching employees', err);
          this.isLoading = false;
        }
      });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.selectedEmployee = null;
  }

  getVisibleEmployees(): Employee[] {
    if (this.activeTab === 'business') {
      return this.employees.filter(e => e.department === this.teamDepartment);
    }
    if (this.activeTab === 'reporting') {
      return this.employees.filter(e => e.id === this.loggedInUserId);
    }
    return [];
  }

  selectEmployee(emp: Employee): void {
    this.selectedEmployee = emp;
  }

  closeEmployeeDetail(): void {
    this.selectedEmployee = null;
  }

  filterEmployees(): void {
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredEmployees = this.employees.filter(emp =>
      emp.name.toLowerCase().includes(search) ||
      emp.id.toString().includes(search) ||
      emp.department.toLowerCase().includes(search)
    );
    this.sortEmployees();
  }

  sortEmployees(): void {
    this.filteredEmployees.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'department': return a.department.localeCompare(b.department);
        case 'designation': return a.designation.localeCompare(b.designation);
        default: return 0;
      }
    });
  }

  aaddEmployee(): void {
  // Generate next ID
  const newId = this.employees.length 
    ? Math.max(...this.employees.map(e => e.id)) + 1 
    : 1;

  // Create an Employee object from form data
  const emp: Employee = {
    id: newId,
    name: this.newEmployee.name || '',
    email: this.newEmployee.email || '',
    department: this.newEmployee.department || '',
    designation: this.newEmployee.designation || '',
    location: this.newEmployee.location || '',
    photo: this.newEmployee.photo || '',
    managerId: undefined,
    team: undefined
  };

  // Push locally for instant UI update
  this.employees.push(emp);

  // Reapply filters & sorting
  this.filterEmployees();

  // Reset form
  this.newEmployee = { 
    name: '', 
    email: '', 
    department: '', 
    designation: '', 
    location: '', 
    photo: '' 
  };

  // Optional: send to API for persistence
  // this.http.post<Employee>('https://api.example.com/employees', emp).subscribe();
}
}