import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Employee } from '../models/employee';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PayrollEmployeeService {

  private apiUrl = 'http://localhost:8080/api/employeePayRole';

  constructor(private http: HttpClient) {}


  getEmployees(): Observable<Employee[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.body as Employee[]),
      catchError(error => {
        console.error('Error fetching employee data:', error);
        return of([]); 
      })
    );
  }

 getEmployeeById(id: number): Observable<Employee> {
  return this.http.get<Employee[]>(`${this.apiUrl}/${id}`).pipe(
    map(response => response[0]),
    catchError(err => {
      console.error('Failed to fetch employee by ID', err);
      return of({} as Employee);
    })
  );
}



  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployeeStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status });
  }
}
