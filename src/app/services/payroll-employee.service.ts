import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root'
})
export class PayrollEmployeeService {

 private apiUrl = 'http://localhost:3000/employees'; // Local JSON path
  employee: any;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }
  getEmployeeById(id: string): Observable<Employee> {
  return this.http.get<Employee>(`${this.apiUrl}/${id}`);
}

  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

 updateEmployeeStatus(id: string, status: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${id}`, { status });
}
}
