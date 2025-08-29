import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Employee } from '../models/employee';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PayrollEmployeeService {

  private apiUrl = 'http://localhost:8080/api/employeePayRole';

  constructor(private http: HttpClient) {}

  // ✅ Fetch all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<{ body: Employee[] }>(this.apiUrl).pipe(
      map(res => res.body),
      catchError(err => {
        console.error('Error fetching employees', err);
        return of([]);
      })
    );
  }

  // ✅ Get single employee by ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<{ body: Employee }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.body),
      catchError(err => {
        console.error('Error fetching employee by id', err);
        return of({} as Employee);
      })
    );
  }

  // ✅ Add new employee
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // ✅ Update employee (PUT)
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  // ✅ Update employee status (PATCH)
  updateEmployeeStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }
}
