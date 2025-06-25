import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
 
  // Directly set the API URL here
  private apiUrl = 'http://localhost:8080/personal/findAll';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

//   Optional: Future search by name feature
//   searchEmployees(name: string): Observable<any[]> {
//     return this.http.get<any[]>(${this.apiUrl}?name=${name});
//   }
}
