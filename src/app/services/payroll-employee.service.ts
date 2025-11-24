import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Employee } from '../models/employee';
import { tap, catchError, map } from 'rxjs/operators';
import { BASE_URL } from '../models/baseurl/constant';

@Injectable({
  providedIn: 'root',
})
export class PayrollEmployeeService {

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<{ body: Employee[] }>(`${BASE_URL}/employeePayRole`).pipe(
      map((res) => res.body),
      catchError((err) => {
        console.error('Error fetching employees', err);
        return of([]);
      })
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<{ body: Employee }>(`${BASE_URL}/employeePayRole/${id}`).pipe(
      map((res) => res.body),
      catchError((err) => {
        console.error('Error fetching employee by id', err);
        return of({} as Employee);
      })
    );
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return this.http
      .post<{ body: Employee }>(`${BASE_URL}/employeePayRole`, employee)
      .pipe(map((res) => res.body));
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http
      .put<{ body: Employee }>(`${BASE_URL}/employeePayRole/${id}`, employee)
      .pipe(map((res) => res.body));
  }

  updateEmployeeStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${BASE_URL}/employeePayRole/${id}/status`, { status });
  }

  getPayRunData(month: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${BASE_URL}/employeePayRole/getPayRunData`, {
        params: { month },
      })
      .pipe(
        tap((data) => console.log('Pay Run Data from API:', data)),
        catchError((err) => {
          console.error('Error fetching Pay Run Data', err);
          return of([]);
        })
      );
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/employeePayRole/${id}`);
  }
}
