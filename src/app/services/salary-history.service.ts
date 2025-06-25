import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalaryHistory } from '../models/salaryHistory';


@Injectable({
  providedIn: 'root'
})
export class SalaryHistoryService {

  private apiUrl = 'http://localhost:3000/salaryHistory'; // json-server url

  constructor(private http: HttpClient) {}

  getAllSalaryHistory(): Observable<SalaryHistory[]> {
    return this.http.get<SalaryHistory[]>(this.apiUrl);
  }

  // getSalaryHistoryByEmployeeId(employeeId: string): Observable<SalaryHistory[]> {
  //   return this.http.get<SalaryHistory[]>(`${this.apiUrl}?employeeId=${employeeId}`);
  // }
  getSalaryByEmployeeAndMonth(empId: string, month: string): Observable<SalaryHistory[]> {
  return this.http.get<SalaryHistory[]>(`${this.apiUrl}?id=${empId}&month=${month}`);
}


  addSalaryHistory(data: SalaryHistory): Observable<SalaryHistory> {
    return this.http.post<SalaryHistory>(this.apiUrl, data);
  }

  updateSalaryHistory(id: number, data: SalaryHistory): Observable<SalaryHistory> {
    return this.http.put<SalaryHistory>(`${this.apiUrl}/${id}`, data);
  }

  deleteSalaryHistory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
